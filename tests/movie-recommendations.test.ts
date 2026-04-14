import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_GROQ_MODEL,
  buildRecommendationPrompt,
  generateMovieRecommendations,
  parseRecommendationPayload,
  resolveGroqConfig,
  type MovieSurveyResponse,
} from "../src/lib/movie-recommendations.js";

const sampleResponses: MovieSurveyResponse[] = [
  {
    person: 1,
    favoriteMovie: "Into the Spider-Verse",
    favoriteReason: "Fast pace, heart, and inventive visuals.",
    movieAge: "new",
    movieMood: "fun",
    timeAvailable: "medium",
  },
  {
    person: 2,
    favoriteMovie: "The Godfather",
    favoriteReason: "Character depth and slow-burn tension.",
    movieAge: "classic",
    movieMood: "serious",
    timeAvailable: "long",
  },
];

test("resolveGroqConfig uses GROQ_* variables and the default model", () => {
  assert.deepEqual(resolveGroqConfig({ GROQ_API_KEY: "secret" }), {
    apiKey: "secret",
    model: DEFAULT_GROQ_MODEL,
  });
});

test("buildRecommendationPrompt includes every person's survey answers", () => {
  const prompt = buildRecommendationPrompt(sampleResponses);

  assert.match(prompt, /Person 1:/);
  assert.match(prompt, /Favorite movie: Into the Spider-Verse/);
  assert.match(prompt, /Available time: long/);
  assert.match(prompt, /Return exactly 2 recommendations/);
});

test("parseRecommendationPayload accepts JSON wrapped in markdown fences", () => {
  const recommendations = parseRecommendationPayload(`\`\`\`json
{
  "recommendations": [
    {
      "person": 1,
      "title": "The Nice Guys",
      "year": "2016",
      "reason": "It matches the playful energy and visual flair they enjoy.",
      "description": "A witty detective comedy with sharp chemistry and energetic set pieces.",
      "contentWarnings": []
    }
  ]
}
\`\`\``);

  assert.equal(recommendations[0]?.title, "The Nice Guys");
  assert.deepEqual(recommendations[0]?.contentWarnings, []);
});

test("generateMovieRecommendations sends the selected model and returns parsed recommendations", async () => {
  let capturedRequest: RequestInit | undefined;

  const mockFetch: typeof fetch = async (_input, init) => {
    capturedRequest = init;
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                recommendations: [
                  {
                    person: 1,
                    title: "Paddington 2",
                    year: "2017",
                    reason: "It keeps the upbeat warmth and charm they want.",
                    description: "A joyful, funny family adventure with a genuinely sweet center.",
                    contentWarnings: [],
                  },
                  {
                    person: 2,
                    title: "Zodiac",
                    year: "2007",
                    reason: "It fits their taste for meticulous, serious storytelling.",
                    description: "A tense investigative thriller with rich character detail.",
                    contentWarnings: ["Violence"],
                  },
                ],
              }),
            },
          },
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  };

  const recommendations = await generateMovieRecommendations(
    sampleResponses,
    { GROQ_API_KEY: "secret", GROQ_MODEL: "llama-3.1-8b-instant" },
    mockFetch,
  );

  assert.equal(recommendations.length, 2);
  assert.equal(recommendations[0]?.title, "Paddington 2");
  assert.equal(recommendations[1]?.contentWarnings?.[0], "Violence");

  const parsedBody = JSON.parse(String(capturedRequest?.body));
  assert.equal(parsedBody.model, "llama-3.1-8b-instant");
  assert.equal(parsedBody.messages[1].role, "user");
});
