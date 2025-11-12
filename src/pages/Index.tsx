import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Compass, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles,
  Heart,
  TrendingUp,
  Award,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Compass,
      title: "Smart Discovery",
      description: "AI-powered destination recommendations based on your preferences and interests",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Calendar,
      title: "AI Itinerary Planner",
      description: "Generate personalized day-by-day travel plans optimized for your time and budget",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: MessageCircle,
      title: "Travel Assistant",
      description: "Chat with AI for instant recommendations, tips, and travel guidance 24/7",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: MapPin,
      title: "Cultural Discovery",
      description: "Explore festivals, local cuisine, and authentic experiences unique to each region",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Sparkles,
      title: "Personalized AI",
      description: "Smart recommendations that learn from your preferences and travel history",
      gradient: "from-accent/20 to-accent/5"
    },
  ];

  const destinations = [
    { name: "Rajasthan", image: "🏰", desc: "Royal palaces & desert adventures" },
    { name: "Kerala", image: "🌴", desc: "Backwaters & tropical paradise" },
    { name: "Goa", image: "🏖️", desc: "Beaches & vibrant culture" },
    { name: "Himachal", image: "⛰️", desc: "Mountain escapes & serenity" },
  ];

  const stats = [
    { icon: MapPin, value: "100+", label: "Destinations" },
    { icon: Heart, value: "1000+", label: "Happy Travelers" },
    { icon: Award, value: "4.9", label: "Average Rating" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Travel Companion</span>
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Discover India's{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">
                Hidden Treasures
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Let AI plan your perfect journey. Smart recommendations, local experts, 
              and authentic experiences - all in one place.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="bg-gradient-warm shadow-warm hover:shadow-elegant transition-all text-lg px-8 group"
                onClick={() => window.location.href = '/plan'}
              >
                Start Planning
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => window.location.href = '/chat'}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Try AI Assistant
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-6 text-center border-border/50 shadow-sm hover:shadow-warm transition-all">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">
                Chandra Tourism
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience travel planning reimagined with AI intelligence and local expertise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className="p-6 hover:shadow-elegant transition-all cursor-pointer group border-border/50"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Destinations Preview */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Popular Destinations</h2>
              <p className="text-muted-foreground text-lg">Start your journey to these incredible places</p>
            </div>
            <Button 
              variant="outline" 
              className="hidden md:flex"
              onClick={() => window.location.href = '/destinations'}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <Card 
                key={dest.name}
                className="overflow-hidden group cursor-pointer border-border/50 hover:shadow-warm transition-all"
              >
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform">
                  {dest.image}
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-muted-foreground">{dest.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of travelers who trust Chandra Tourism for their perfect Indian getaway
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8"
                onClick={() => window.location.href = '/destinations'}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Explore Destinations
              </Button>
              <Button 
                size="lg" 
                className="bg-background text-foreground hover:bg-background/90 text-lg px-8"
                onClick={() => window.location.href = '/chat'}
              >
                Talk to AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold mb-4">
              Meet the{" "}
              <span className="bg-gradient-warm bg-clip-text text-transparent">
                Developer
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Have questions or need assistance? Get in touch with us
            </p>
            
            <Card className="p-8 border-border/50 shadow-warm">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-warm flex items-center justify-center">
                    <Users className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">Chandrashekhar</h3>
                  <p className="text-muted-foreground">Full Stack Developer</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-warm shadow-warm hover:shadow-elegant transition-all"
                    onClick={() => window.location.href = 'tel:+917975256005'}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Call: 7975256005
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.open('https://wa.me/7975256005?text=Hello%20Chandrashekhar!%20I%20need%20help%20with%20my%20travel%20plans.', '_blank')}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    WhatsApp: 7975256005
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Compass className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">Chandra Tourism</span>
          </div>
          <p className="text-sm">
            Making travel simple, smart, and soulful - where technology meets emotion
          </p>
          <p className="text-xs mt-4">
            © 2025 Chandra Tourism. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
