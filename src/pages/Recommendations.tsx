
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  clearStoredMovieResponses,
  getStoredMovieResponses,
} from "@/lib/storage";
import {
  generateMovieRecommendations,
  type MovieRecommendation,
} from "@/lib/movie-recommendations";
import { Popcorn, ArrowLeft, ArrowRight, Clapperboard, LoaderCircle } from "lucide-react";

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const groupSize = parseInt(searchParams.get("groupSize") || "1");
  const currentPerson = parseInt(searchParams.get("person") || "1");
  
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const loadRecommendations = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const storedResponses = getStoredMovieResponses();
        const generatedRecommendations = await generateMovieRecommendations(
          storedResponses,
        );

        if (!isCancelled) {
          setRecommendations(generatedRecommendations);
        }
      } catch (error) {
        if (!isCancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong while generating your movie picks.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      isCancelled = true;
    };
  }, []);

  const currentMovie = recommendations.find(
    (recommendation) => recommendation.person === currentPerson,
  );

  const handleNextPerson = () => {
    if (currentPerson < groupSize) {
      navigate(`/recommendations?groupSize=${groupSize}&person=${currentPerson + 1}`);
    }
  };

  const handlePrevPerson = () => {
    if (currentPerson > 1) {
      navigate(`/recommendations?groupSize=${groupSize}&person=${currentPerson - 1}`);
    }
  };

  const handleTryAgain = () => {
    clearStoredMovieResponses();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900">
      {/* Header */}
      <div className="flex items-center justify-center space-x-3 pt-6 pb-4">
        <div className="bg-yellow-400 p-3 rounded-full">
          <Popcorn className="h-8 w-8 text-red-800" />
        </div>
        <h1 className="text-4xl font-bold text-yellow-400">PoPChoice</h1>
      </div>

      {/* Person indicator */}
      {groupSize > 1 && (
        <div className="text-center mb-6">
          <span className="text-yellow-400 text-xl font-semibold">
            Recommendation for Person {currentPerson}
          </span>
        </div>
      )}

      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <Card className="bg-black/40 backdrop-blur-sm border-yellow-400/30 shadow-2xl mb-8">
              <CardContent className="p-10 flex flex-col items-center text-center gap-4">
                <LoaderCircle className="h-12 w-12 text-yellow-400 animate-spin" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-yellow-400">
                    Finding your movie match
                  </h2>
                  <p className="text-yellow-100">
                    Groq is turning your group's answers into tailored recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : errorMessage ? (
            <Card className="bg-black/40 backdrop-blur-sm border-red-400/40 shadow-2xl mb-8">
              <CardContent className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-300">
                  Recommendation generation failed
                </h2>
                <p className="text-yellow-100">{errorMessage}</p>
                <p className="text-yellow-200/80 text-sm">
                  This app reads `GROQ_API_KEY` and `GROQ_MODEL` from Vite at runtime.
                </p>
              </CardContent>
            </Card>
          ) : currentMovie ? (
            <>
              <div className="relative mb-8 overflow-hidden rounded-2xl shadow-2xl border border-yellow-400/20 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.35),_rgba(127,29,29,0.92)_42%,_rgba(17,24,39,0.98)_100%)]">
                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,0,0,0.1),rgba(0,0,0,0.55))]" />
                <div className="relative p-10 sm:p-14 min-h-80 flex flex-col justify-end">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="rounded-full bg-yellow-400/20 p-3 border border-yellow-300/30">
                      <Clapperboard className="h-8 w-8 text-yellow-300" />
                    </div>
                    <span className="text-sm uppercase tracking-[0.35em] text-yellow-200/80">
                      AI Pick
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                    {currentMovie.title}
                  </h2>
                  <p className="text-xl text-yellow-300 mt-3">{currentMovie.year}</p>
                </div>
              </div>

              <Card className="bg-black/40 backdrop-blur-sm border-yellow-400/30 shadow-2xl mb-8">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                        Why this movie?
                      </h3>
                      <p className="text-yellow-100 text-lg leading-relaxed">
                        {currentMovie.reason}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                        What to expect:
                      </h3>
                      <p className="text-yellow-100 text-lg leading-relaxed">
                        {currentMovie.description}
                      </p>
                    </div>

                    {currentMovie.contentWarnings && currentMovie.contentWarnings.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-semibold text-yellow-400 mb-3">
                          Content notes:
                        </h3>
                        <p className="text-yellow-100 text-lg leading-relaxed">
                          {currentMovie.contentWarnings.join(", ")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-black/40 backdrop-blur-sm border-yellow-400/30 shadow-2xl mb-8">
              <CardContent className="p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-yellow-400">
                  No recommendation found
                </h2>
                <p className="text-yellow-100">
                  We generated picks, but none matched this viewer slot. Try again to refresh the quest.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {groupSize > 1 && (
              <div className="flex gap-4">
                <Button
                  onClick={handlePrevPerson}
                  disabled={currentPerson === 1}
                  variant="outline"
                  className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Person
                </Button>
                
                <Button
                  onClick={handleNextPerson}
                  disabled={currentPerson === groupSize}
                  className="bg-yellow-400 text-red-900 hover:bg-yellow-300"
                >
                  Next Person
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
            
            <Button
              onClick={handleTryAgain}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
