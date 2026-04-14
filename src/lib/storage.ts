import type { MovieSurveyResponse } from "@/lib/movie-recommendations";

const MOVIE_RESPONSES_KEY = "movieResponses";

export function getStoredMovieResponses(): MovieSurveyResponse[] {
  const rawValue = localStorage.getItem(MOVIE_RESPONSES_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? (parsed as MovieSurveyResponse[]) : [];
  } catch {
    return [];
  }
}

export function saveMovieResponse(response: MovieSurveyResponse) {
  const existingResponses = getStoredMovieResponses();
  localStorage.setItem(
    MOVIE_RESPONSES_KEY,
    JSON.stringify([...existingResponses, response]),
  );
}

export function clearStoredMovieResponses() {
  localStorage.removeItem(MOVIE_RESPONSES_KEY);
}
