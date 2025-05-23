
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popcorn, ArrowLeft, ArrowRight } from "lucide-react";

// Mock movie data (in real app, this would come from your vector database)
const mockMovies = [
  {
    title: "Everything Everywhere All at Once",
    year: "2022",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=750&fit=crop",
    description: "A mind-bending multiverse adventure that perfectly blends comedy, action, and heartfelt family drama. This genre-defying film offers both fun and emotional depth.",
    reason: "Based on your love for innovative storytelling and preference for something that's both entertaining and meaningful."
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023", 
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=750&fit=crop",
    description: "A visually stunning animated adventure that revolutionizes superhero storytelling with incredible art and genuine heart.",
    reason: "Perfect for your taste in action-packed entertainment with amazing visuals and character development."
  },
  {
    title: "Oppenheimer",
    year: "2023",
    poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=750&fit=crop", 
    description: "A masterful biographical thriller that explores the complex moral implications of scientific discovery and human ambition.",
    reason: "Matches your preference for serious, thought-provoking cinema with outstanding performances and direction."
  }
];

const Recommendations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const groupSize = parseInt(searchParams.get("groupSize") || "1");
  const currentPerson = parseInt(searchParams.get("person") || "1");
  
  const [responses, setResponses] = useState<any[]>([]);
  const [currentMovie, setCurrentMovie] = useState(mockMovies[0]);

  useEffect(() => {
    const storedResponses = JSON.parse(localStorage.getItem("movieResponses") || "[]");
    setResponses(storedResponses);
    
    // In a real app, you would use the responses to generate recommendations via OpenAI embeddings
    // For now, we'll cycle through mock movies based on person number
    setCurrentMovie(mockMovies[(currentPerson - 1) % mockMovies.length]);
  }, [currentPerson]);

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
    localStorage.removeItem("movieResponses");
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
          {/* Movie Poster - Full Width */}
          <div className="relative mb-8">
            <div 
              className="w-full h-96 bg-cover bg-center rounded-2xl shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${currentMovie.poster})`,
              }}
            >
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-4xl font-bold mb-2 drop-shadow-lg">
                  {currentMovie.title}
                </h2>
                <p className="text-xl text-yellow-300 drop-shadow-md">
                  {currentMovie.year}
                </p>
              </div>
            </div>
          </div>

          {/* Movie Details */}
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
              </div>
            </CardContent>
          </Card>

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
