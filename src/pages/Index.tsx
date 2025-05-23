
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Popcorn } from "lucide-react";

const Index = () => {
  const [groupSize, setGroupSize] = useState<number>(1);
  const [timeAvailable, setTimeAvailable] = useState<string>("");
  const navigate = useNavigate();

  const handleStart = () => {
    if (timeAvailable) {
      navigate(`/questionnaire?groupSize=${groupSize}&time=${timeAvailable}&person=1`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo Section */}
        <div className="flex items-center justify-center space-x-4 mb-12">
          <div className="bg-yellow-400 p-4 rounded-full shadow-2xl">
            <Popcorn className="h-12 w-12 text-red-800" />
          </div>
          <h1 className="text-6xl font-bold text-yellow-400 tracking-wide drop-shadow-lg">
            PoPChoice
          </h1>
        </div>

        <p className="text-xl text-yellow-100 mb-8 leading-relaxed">
          Discover your perfect movie match with AI-powered recommendations
        </p>

        {/* Setup Form */}
        <Card className="bg-black/40 backdrop-blur-sm border-yellow-400/30 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-yellow-400">Let's get started!</h3>
              
              {/* Group Size Selection */}
              <div className="space-y-3">
                <label className="text-lg text-yellow-100 block">
                  How many people are watching tonight?
                </label>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[1, 2, 3, 4, 5, 6].map((size) => (
                    <Button
                      key={size}
                      onClick={() => setGroupSize(size)}
                      variant={groupSize === size ? "default" : "outline"}
                      className={`w-12 h-12 rounded-full text-lg font-bold transition-all duration-200 ${
                        groupSize === size
                          ? "bg-yellow-400 text-red-900 hover:bg-yellow-300"
                          : "border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                      }`}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Available */}
              <div className="space-y-3">
                <label className="text-lg text-yellow-100 block">
                  How much time do you have?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { value: "short", label: "1-2 hours", emoji: "⚡" },
                    { value: "medium", label: "2-3 hours", emoji: "🍿" },
                    { value: "long", label: "3+ hours", emoji: "🎬" }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      onClick={() => setTimeAvailable(option.value)}
                      variant={timeAvailable === option.value ? "default" : "outline"}
                      className={`p-4 h-auto transition-all duration-200 ${
                        timeAvailable === option.value
                          ? "bg-yellow-400 text-red-900 hover:bg-yellow-300"
                          : "border-yellow-400 text-yellow-400 hover:bg-yellow-400/10"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div className="font-semibold">{option.label}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleStart}
              disabled={!timeAvailable}
              className="w-full bg-yellow-400 text-red-900 hover:bg-yellow-300 text-xl font-bold py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Start the Quest! 🚀
            </Button>
          </CardContent>
        </Card>

        <div className="text-yellow-200/60 text-sm">
          Powered by AI • Find movies that match your vibe
        </div>
      </div>
    </div>
  );
};

export default Index;
