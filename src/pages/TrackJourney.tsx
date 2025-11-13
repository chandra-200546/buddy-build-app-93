import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Activity {
  title: string;
  location: string;
  time: string;
  description: string;
}

interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

const TrackJourney = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestDestination, setNearestDestination] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  
  // Get itinerary from navigation state or localStorage
  const getItinerary = () => {
    if (location.state?.itinerary) {
      return location.state.itinerary;
    }
    const stored = localStorage.getItem('currentItinerary');
    return stored ? JSON.parse(stored) : null;
  };
  
  const itinerary = getItinerary();

  useEffect(() => {
    if (!itinerary) {
      toast({
        title: "No Itinerary Found",
        description: "Please generate an itinerary first.",
        variant: "destructive",
      });
      navigate("/plan");
      return;
    }

    // Request user location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          updateMap(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to access your location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add destination markers
      if (itinerary?.days) {
        itinerary.days.forEach((day: Day) => {
          day.activities?.forEach((activity: Activity) => {
            // For demo purposes, we'll place markers randomly in India
            // In production, you'd geocode the actual locations
            const lat = 20.5937 + (Math.random() - 0.5) * 20;
            const lng = 78.9629 + (Math.random() - 0.5) * 20;

            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "custom-destination-marker",
                html: `<div style="background-color: #E97451; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${day.day}</div>`,
                iconSize: [32, 32],
              }),
            }).addTo(mapInstanceRef.current!);

            marker.bindPopup(`
              <div style="max-width: 200px;">
                <strong>${activity.title}</strong><br/>
                <small>${activity.time}</small><br/>
                <em>${activity.location}</em>
              </div>
            `);
          });
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [itinerary]);

  const updateMap = (location: { lat: number; lng: number }) => {
    if (!mapInstanceRef.current) return;

    // Update or create user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      userMarkerRef.current = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: "custom-user-marker",
          html: `<div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 20px; height: 20px; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); animation: pulse 2s infinite;"></div>`,
          iconSize: [20, 20],
        }),
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.bindPopup("<strong>You are here</strong>");
    }

    // Center map on user location
    mapInstanceRef.current.setView([location.lat, location.lng], 13);

    // Calculate nearest destination (simplified)
    calculateNearestDestination(location);
  };

  const calculateNearestDestination = (userLoc: { lat: number; lng: number }) => {
    // Simplified distance calculation
    // In production, use proper geocoding and routing APIs
    if (itinerary?.days?.[0]?.activities?.[0]) {
      const firstActivity = itinerary.days[0].activities[0];
      setNearestDestination(firstActivity.title);
      // Random distance for demo
      setDistance(Math.random() * 10);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/plan")}
              className="mb-4"
            >
              ← Back to Itinerary
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">
              Track Your <span className="bg-gradient-warm bg-clip-text text-transparent">Journey</span>
            </h1>
            <p className="text-muted-foreground">
              Real-time location tracking for your trip
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <Card className="lg:col-span-2 p-0 overflow-hidden shadow-elegant">
              <div 
                ref={mapRef} 
                className="w-full h-[600px]"
                style={{ position: "relative" }}
              />
            </Card>

            {/* Info Panel */}
            <div className="space-y-4">
              {userLocation ? (
                <>
                  <Card className="p-6 shadow-elegant">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Navigation className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Your Location</h3>
                        <p className="text-sm text-muted-foreground">Live tracking active</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-muted/30 p-2 rounded">
                      {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </div>
                  </Card>

                  {nearestDestination && (
                    <Card className="p-6 shadow-elegant">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Next Destination</h3>
                          <p className="text-sm text-muted-foreground">{nearestDestination}</p>
                        </div>
                      </div>
                      {distance !== null && (
                        <div className="text-2xl font-bold text-primary">
                          {distance.toFixed(1)} km away
                        </div>
                      )}
                    </Card>
                  )}

                  <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Today's Activities
                    </h3>
                    {itinerary?.days?.[0]?.activities?.map((activity: Activity, idx: number) => (
                      <div key={idx} className="mb-3 pb-3 border-b border-border/50 last:border-0">
                        <div className="flex items-start gap-2">
                          <span className="text-xs font-semibold text-primary mt-1">{activity.time}</span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.location}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </>
              ) : (
                <Card className="p-6 shadow-elegant">
                  <div className="flex items-center gap-3 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="font-semibold">Waiting for location...</p>
                      <p className="text-sm text-muted-foreground">Please enable location services</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default TrackJourney;
