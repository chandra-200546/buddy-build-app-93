import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Users, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { generateItinerary } from "@/utils/aiClient";
import { useToast } from "@/hooks/use-toast";

const Plan = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "2",
    budget: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setItinerary(null);

    try {
      const result = await generateItinerary(formData);
      setItinerary(result.itinerary);
      toast({
        title: "Itinerary Generated!",
        description: "Your personalized travel plan is ready.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate itinerary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Trip Planning</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Plan Your Perfect{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Let AI create a personalized itinerary based on your preferences
            </p>
          </div>

          <Card className="p-8 shadow-elegant">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Where do you want to go?
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Rajasthan, Kerala, Goa..."
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelers" className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Number of Travelers
                </Label>
                <Input
                  id="travelers"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.travelers}
                  onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Budget Range
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {["budget", "medium", "luxury"].map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={formData.budget === level ? "default" : "outline"}
                      onClick={() => setFormData({...formData, budget: level})}
                      className="capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-gradient-warm shadow-warm hover:shadow-elegant transition-all"
                disabled={loading}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {loading ? "Generating..." : "Generate AI Itinerary"}
              </Button>
            </form>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>AI will generate a personalized day-by-day itinerary with activities, restaurants, and local tips</p>
          </div>

          {/* Itinerary Display */}
          {itinerary && (
            <Card className="mt-8 p-8 shadow-elegant">
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-2">{itinerary.title}</h2>
                <p className="text-muted-foreground mb-4">{itinerary.overview}</p>
                <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
                  Total Estimated Cost: {itinerary.totalEstimatedCost}
                </div>
              </div>

              <div className="space-y-8">
                {itinerary.days?.map((day: any) => (
                  <div key={day.day} className="border-l-4 border-primary pl-6">
                    <h3 className="text-2xl font-bold mb-2">
                      Day {day.day}: {day.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{day.date}</p>

                    <div className="space-y-4 mb-4">
                      <h4 className="font-semibold text-lg">Activities</h4>
                      {day.activities?.map((activity: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs font-semibold text-primary">{activity.time}</span>
                              <h5 className="font-semibold">{activity.title}</h5>
                            </div>
                            <span className="text-sm text-muted-foreground">{activity.cost}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                          <p className="text-xs text-primary flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </p>
                        </div>
                      ))}
                    </div>

                    {day.meals && day.meals.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h4 className="font-semibold">Meals</h4>
                        {day.meals.map((meal: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              <strong>{meal.type}:</strong> {meal.dish} at {meal.restaurant}
                            </span>
                            <span className="text-muted-foreground">{meal.cost}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {day.culturalTips && (
                      <div className="bg-accent/20 p-3 rounded-lg mb-2">
                        <p className="text-sm"><strong>Cultural Tips:</strong> {day.culturalTips}</p>
                      </div>
                    )}

                    <p className="text-sm font-semibold">
                      Daily Estimated Cost: {day.estimatedCost}
                    </p>
                  </div>
                ))}
              </div>

              {itinerary.generalTips && itinerary.generalTips.length > 0 && (
                <div className="mt-8 p-6 bg-primary/5 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">General Tips</h3>
                  <ul className="space-y-2">
                    {itinerary.generalTips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Plan;
