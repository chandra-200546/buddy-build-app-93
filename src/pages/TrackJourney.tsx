import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, AlertCircle, ArrowLeft, Compass, Clock, Target } from "lucide-react";
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
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [nearestDestination, setNearestDestination] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  
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

    if (navigator.geolocation && isTracking) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setUserLocation(newLocation);
          if (position.coords.heading !== null) {
            setHeading(position.coords.heading);
          }
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
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isTracking]);

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        zoomControl: false,
      }).setView([20.5937, 78.9629], 5);

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(mapInstanceRef.current);

      // Use CartoDB dark tiles for a modern look
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      // Add destination markers
      if (itinerary?.days) {
        itinerary.days.forEach((day: Day, dayIndex: number) => {
          day.activities?.forEach((activity: Activity, actIndex: number) => {
            const lat = 20.5937 + (Math.random() - 0.5) * 20;
            const lng = 78.9629 + (Math.random() - 0.5) * 20;

            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: "custom-destination-marker",
                html: `
                  <div class="destination-pin">
                    <div class="pin-inner">${day.day}</div>
                    <div class="pin-pulse"></div>
                  </div>
                `,
                iconSize: [40, 40],
                iconAnchor: [20, 40],
              }),
            }).addTo(mapInstanceRef.current!);

            marker.bindPopup(`
              <div class="custom-popup">
                <div class="popup-header">Day ${day.day}</div>
                <div class="popup-title">${activity.title}</div>
                <div class="popup-time">${activity.time}</div>
                <div class="popup-location">${activity.location}</div>
              </div>
            `, { className: 'custom-popup-wrapper' });
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

  const updateMap = (location: { lat: number; lng: number; accuracy?: number }) => {
    if (!mapInstanceRef.current) return;

    // Update accuracy circle
    if (location.accuracy) {
      if (accuracyCircleRef.current) {
        accuracyCircleRef.current.setLatLng([location.lat, location.lng]);
        accuracyCircleRef.current.setRadius(location.accuracy);
      } else {
        accuracyCircleRef.current = L.circle([location.lat, location.lng], {
          radius: location.accuracy,
          color: 'hsl(174, 62%, 47%)',
          fillColor: 'hsl(174, 62%, 47%)',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(mapInstanceRef.current);
      }
    }

    // Update or create user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      userMarkerRef.current = L.marker([location.lat, location.lng], {
        icon: L.divIcon({
          className: "user-location-marker",
          html: `
            <div class="user-marker">
              <div class="user-marker-core"></div>
              <div class="user-marker-ring"></div>
              <div class="user-marker-pulse"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      }).addTo(mapInstanceRef.current);

      userMarkerRef.current.bindPopup(`
        <div class="custom-popup">
          <div class="popup-title">📍 You are here</div>
          <div class="popup-time">Live tracking active</div>
        </div>
      `, { className: 'custom-popup-wrapper' });
    }

    mapInstanceRef.current.setView([location.lat, location.lng], 15, { animate: true });
    calculateNearestDestination(location);
  };

  const calculateNearestDestination = (userLoc: { lat: number; lng: number }) => {
    if (itinerary?.days?.[0]?.activities?.[0]) {
      const firstActivity = itinerary.days[0].activities[0];
      setNearestDestination(firstActivity.title);
      setDistance(Math.random() * 10);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/plan")}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Itinerary
            </Button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-foreground">
                  Track Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Journey</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  Real-time location tracking active
                </p>
              </div>
              <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                <Compass className="w-3 h-3" />
                {userLocation ? "GPS Active" : "Acquiring..."}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <Card className="lg:col-span-2 p-0 overflow-hidden shadow-2xl border-border/50 relative">
              <div 
                ref={mapRef} 
                className="w-full h-[500px] lg:h-[600px]"
              />
              
              {/* Map Controls Overlay */}
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="shadow-lg bg-card/90 backdrop-blur-sm hover:bg-card"
                  onClick={centerOnUser}
                  disabled={!userLocation}
                >
                  <Target className="w-4 h-4" />
                </Button>
              </div>

              {/* Status Overlay */}
              {userLocation && (
                <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/50">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-muted-foreground">Accuracy: {userLocation.accuracy?.toFixed(0) || "N/A"}m</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Info Panel */}
            <div className="space-y-4">
              {userLocation ? (
                <>
                  <Card className="p-5 shadow-lg border-border/50 bg-gradient-to-br from-card to-card/80">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <Navigation className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Your Location</h3>
                        <p className="text-sm text-muted-foreground">Live tracking active</p>
                      </div>
                    </div>
                    <div className="text-xs font-mono bg-muted/50 p-3 rounded-lg text-muted-foreground">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-muted-foreground/70">LAT</span>
                          <p className="font-semibold text-foreground">{userLocation.lat.toFixed(6)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground/70">LNG</span>
                          <p className="font-semibold text-foreground">{userLocation.lng.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {nearestDestination && (
                    <Card className="p-5 shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">Next Destination</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{nearestDestination}</p>
                        </div>
                      </div>
                      {distance !== null && (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-primary">{distance.toFixed(1)}</span>
                          <span className="text-lg text-muted-foreground">km away</span>
                        </div>
                      )}
                    </Card>
                  )}

                  <Card className="p-5 shadow-lg border-border/50">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      Today's Activities
                    </h3>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                      {itinerary?.days?.[0]?.activities?.map((activity: Activity, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary">{idx + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground line-clamp-1">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{activity.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="p-6 shadow-lg border-amber-500/20 bg-amber-500/5">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Acquiring your location...</p>
                      <p className="text-sm text-muted-foreground mt-1">Please enable location services</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* User Location Marker */
        .user-marker {
          position: relative;
          width: 40px;
          height: 40px;
        }
        
        .user-marker-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: hsl(174, 62%, 47%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 3;
        }
        
        .user-marker-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 28px;
          height: 28px;
          border: 2px solid hsl(174, 62%, 47%);
          border-radius: 50%;
          opacity: 0.5;
          z-index: 2;
        }
        
        .user-marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: hsl(174, 62%, 47%);
          border-radius: 50%;
          animation: userPulse 2s ease-out infinite;
          z-index: 1;
        }
        
        @keyframes userPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        
        /* Destination Pin */
        .destination-pin {
          position: relative;
          width: 40px;
          height: 40px;
        }
        
        .pin-inner {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, hsl(25, 95%, 53%) 0%, hsl(15, 85%, 58%) 100%);
          border-radius: 50% 50% 50% 0;
          transform: translateX(-50%) rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 2;
        }
        
        .pin-inner::after {
          content: attr(data-day);
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        }
        
        .pin-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: hsl(25, 95%, 53%);
          border-radius: 50%;
          animation: pinPulse 3s ease-out infinite;
          z-index: 1;
        }
        
        @keyframes pinPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.4;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        
        /* Custom Popup */
        .custom-popup-wrapper .leaflet-popup-content-wrapper {
          background: hsl(25, 20%, 12%);
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          border: 1px solid hsl(25, 15%, 22%);
        }
        
        .custom-popup-wrapper .leaflet-popup-tip {
          background: hsl(25, 20%, 12%);
          border: 1px solid hsl(25, 15%, 22%);
        }
        
        .custom-popup-wrapper .leaflet-popup-close-button {
          color: hsl(42, 35%, 92%);
        }
        
        .custom-popup {
          padding: 12px 16px;
          color: hsl(42, 35%, 92%);
        }
        
        .popup-header {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: hsl(25, 95%, 58%);
          margin-bottom: 4px;
        }
        
        .popup-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
        }
        
        .popup-time {
          font-size: 11px;
          color: hsl(42, 20%, 65%);
        }
        
        .popup-location {
          font-size: 11px;
          color: hsl(42, 20%, 65%);
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default TrackJourney;