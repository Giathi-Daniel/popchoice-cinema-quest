
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popcorn, User } from "lucide-react";

const Questionnaire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const groupSize = parseInt(searchParams.get("groupSize") || "1");
  const timeAvailable = searchParams.get("time") || "";
  const currentPerson = parseInt(searchParams.get("person") || "1");
  
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [favoriteReason, setFavoriteReason] = useState("");
  const [movieAge, setMovieAge] = useState("");
  const [movieMood, setMovieMood] = useState("");

  const handleNext = () => {
    // Store responses in localStorage (in real app, this would go to your vector database)
    const responses = JSON.parse(localStorage.getItem("movieResponses") || "[]");
    responses.push({
      person: currentPerson,
      favoriteMovie,
      favoriteReason,
      movieAge,
      movieMood,
      timeAvailable
    });
    localStorage.setItem("movieResponses", JSON.stringify(responses));

    if (currentPerson < groupSize) {
      // Go to next person
      navigate(`/questionnaire?groupSize=${groupSize}&time=${timeAvailable}&person=${currentPerson + 1}`);
    } else {
      // Generate recommendations
      navigate(`/recommendations?groupSize=${groupSize}&person=1`);
    }
  };

  const isFormComplete = favoriteMovie && favoriteReason && movieAge && movieMood;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center space-x-3 mb-8 pt-6">
          <div className="bg-yellow-400 p-3 rounded-full">
            <Popcorn className="h-8 w-8 text-red-800" />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400">PoPChoice</h1>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 space-x-2">
          <User className="h-5 w-5 text-yellow-400" />
          <span className="text-yellow-400 text-lg font-semibold">
            Person {currentPerson} of {groupSize}
          </span>
        </div>

        <Card className="bg-black/40 backdrop-blur-sm border-yellow-400/30 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-yellow-400">
              Tell us about your movie preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            {/* Favorite Movie */}
            <div className="space-y-3">
              <Label className="text-lg text-yellow-100">
                What's your favorite movie?
              </Label>
              <Textarea
                value={favoriteMovie}
                onChange={(e) => setFavoriteMovie(e.target.value)}
                placeholder="Enter your favorite movie title..."
                className="bg-black/30 border-yellow-400/50 text-yellow-100 placeholder:text-yellow-400/60 focus:border-yellow-400 min-h-[60px]"
              />
            </div>

            {/* Why it's favorite */}
            <div className="space-y-3">
              <Label className="text-lg text-yellow-100">
                What do you love about it?
              </Label>
              <Textarea
                value={favoriteReason}
                onChange={(e) => setFavoriteReason(e.target.value)}
                placeholder="The story, characters, action, emotions... tell us why you love it!"
                className="bg-black/30 border-yellow-400/50 text-yellow-100 placeholder:text-yellow-400/60 focus:border-yellow-400 min-h-[80px]"
              />
            </div>

            {/* New vs Classic */}
            <div className="space-y-4">
              <Label className="text-lg text-yellow-100">
                Are you in the mood for something new or classic?
              </Label>
              <RadioGroup value={movieAge} onValueChange={setMovieAge}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors">
                    <RadioGroupItem value="new" id="new" className="border-yellow-400 text-yellow-400" />
                    <Label htmlFor="new" className="text-yellow-100 cursor-pointer flex-1">
                      <div className="font-semibold">Something New 🆕</div>
                      <div className="text-sm text-yellow-200/80">Recent releases & modern films</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors">
                    <RadioGroupItem value="classic" id="classic" className="border-yellow-400 text-yellow-400" />
                    <Label htmlFor="classic" className="text-yellow-100 cursor-pointer flex-1">
                      <div className="font-semibold">Classic Vibes 🎭</div>
                      <div className="text-sm text-yellow-200/80">Timeless classics & older gems</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Fun vs Serious */}
            <div className="space-y-4">
              <Label className="text-lg text-yellow-100">
                Do you want to have fun or something more serious?
              </Label>
              <RadioGroup value={movieMood} onValueChange={setMovieMood}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors">
                    <RadioGroupItem value="fun" id="fun" className="border-yellow-400 text-yellow-400" />
                    <Label htmlFor="fun" className="text-yellow-100 cursor-pointer flex-1">
                      <div className="font-semibold">Let's Have Fun! 🎉</div>
                      <div className="text-sm text-yellow-200/80">Comedy, adventure, feel-good movies</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 rounded-lg border border-yellow-400/30 hover:bg-yellow-400/10 transition-colors">
                    <RadioGroupItem value="serious" id="serious" className="border-yellow-400 text-yellow-400" />
                    <Label htmlFor="serious" className="text-yellow-100 cursor-pointer flex-1">
                      <div className="font-semibold">Something Deep 🎭</div>
                      <div className="text-sm text-yellow-200/80">Drama, thriller, thought-provoking</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleNext}
              disabled={!isFormComplete}
              className="w-full bg-yellow-400 text-red-900 hover:bg-yellow-300 text-xl font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {currentPerson < groupSize ? "Next Person →" : "Get Movie Recommendations! 🎬"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Questionnaire;
