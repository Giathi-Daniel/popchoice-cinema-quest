export const DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant";

export type MovieSurveyResponse = {
  person: number;
  favoriteMovie: string;
  favoriteReason: string;
  movieAge: string;
  movieMood: string;
  timeAvailable: string;
};

export type MovieRecommendation = {
  person: number;
  title: string;
  year: string;
  reason: string;
  description: string;
  contentWarnings?: string[];
};

export type GroqEnv = {
  GROQ_API_KEY?: string;
  GROQ_MODEL?: string;
  VITE_GROQ_API_KEY?: string;
  VITE_GROQ_MODEL?: string;
};

type GroqMessage = {
  content?: string | null;
};

type GroqResponse = {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: GroqMessage;
  }>;
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export function readGroqEnv(): GroqEnv {
  const metaEnv = (import.meta as { env?: GroqEnv }).env;
  return metaEnv ?? {};
}

export function resolveGroqConfig(env: GroqEnv) {
  const apiKey = env.GROQ_API_KEY ?? env.VITE_GROQ_API_KEY;
  const model = env.GROQ_MODEL ?? env.VITE_GROQ_MODEL ?? DEFAULT_GROQ_MODEL;

  if (!apiKey) {
    throw new Error(
      "Missing Groq API key. Add GROQ_API_KEY to your .env before generating recommendations.",
    );
  }

  return { apiKey, model };
}

export function buildRecommendationPrompt(responses: MovieSurveyResponse[]) {
  const formattedResponses = responses
    .map((response) => {
      return [
        `Person ${response.person}:`,
        `- Favorite movie: ${response.favoriteMovie}`,
        `- Why they love it: ${response.favoriteReason}`,
        `- Wants: ${response.movieAge} movies`,
        `- Mood: ${response.movieMood}`,
        `- Available time: ${response.timeAvailable}`,
      ].join("\n");
    })
    .join("\n\n");

  return `
You are a movie recommendation assistant for a group watch app called PoPChoice.

Given the viewer survey answers below, return one movie recommendation per person.
Keep recommendations varied and grounded in real, well-known films.
Match each person to their own taste and time constraints.

Viewer responses:
${formattedResponses}

Return valid JSON only in this shape:
{
  "recommendations": [
    {
      "person": 1,
      "title": "Movie Title",
      "year": "2023",
      "reason": "Why this film fits the person's stated taste.",
      "description": "A short, spoiler-free summary of what they should expect.",
      "contentWarnings": ["optional warning"]
    }
  ]
}

Rules:
- Do not wrap the JSON in markdown fences.
- Return exactly ${responses.length} recommendations.
- Keep each "reason" under 40 words.
- Keep each "description" under 55 words.
- Use an empty array for "contentWarnings" when there are no notable warnings.
  `.trim();
}

export function parseRecommendationPayload(payload: string): MovieRecommendation[] {
  const normalizedPayload = payload
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  const parsed = JSON.parse(normalizedPayload) as {
    recommendations?: unknown;
  };

  if (!Array.isArray(parsed.recommendations)) {
    throw new Error("Groq response did not include a recommendations array.");
  }

  return parsed.recommendations.map((item, index) => {
    const recommendation = item as Partial<MovieRecommendation>;

    if (
      typeof recommendation.person !== "number" ||
      typeof recommendation.title !== "string" ||
      typeof recommendation.year !== "string" ||
      typeof recommendation.reason !== "string" ||
      typeof recommendation.description !== "string"
    ) {
      throw new Error(`Recommendation ${index + 1} is missing required fields.`);
    }

    return {
      person: recommendation.person,
      title: recommendation.title,
      year: recommendation.year,
      reason: recommendation.reason,
      description: recommendation.description,
      contentWarnings: Array.isArray(recommendation.contentWarnings)
        ? recommendation.contentWarnings.filter(
            (warning): warning is string => typeof warning === "string" && warning.length > 0,
          )
        : [],
    };
  });
}

export async function generateMovieRecommendations(
  responses: MovieSurveyResponse[],
  env: GroqEnv = readGroqEnv(),
  fetchImpl: typeof fetch = fetch,
) {
  if (responses.length === 0) {
    throw new Error("No movie responses found. Start a new recommendation quest first.");
  }

  const { apiKey, model } = resolveGroqConfig(env);
  const prompt = buildRecommendationPrompt(responses);

  const response = await fetchImpl(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You recommend movies for a cinema-night app. Reply with strict JSON only and no markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = (await response.json()) as GroqResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? "Groq request failed.");
  }

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty recommendation payload.");
  }

  return parseRecommendationPayload(content);
}
