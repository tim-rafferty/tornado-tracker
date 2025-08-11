import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Volume2, MapPin, Clock } from "lucide-react";
import { useState } from "react";

const AlertDemoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDemoAlert = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Experience the Alert System
          </h2>
          <p className="text-xl text-muted-foreground">
            See how Tornado Tracker's critical alerts work when severe weather threatens your safety
          </p>
        </div>

        {/* Demo Alert Card */}
        <Card className={`p-8 mb-8 transition-all duration-500 ${
          isPlaying 
            ? 'bg-alert-red/20 border-alert-red shadow-[0_0_40px_hsl(var(--alert-red)/0.3)] animate-pulse' 
            : 'bg-card'
        }`}>
          <div className="flex items-center justify-center mb-6">
            <AlertTriangle className={`w-16 h-16 ${
              isPlaying ? 'text-alert-red animate-bounce' : 'text-muted-foreground'
            }`} />
          </div>
          
          <div className="space-y-4">
            <Badge variant={isPlaying ? "destructive" : "secondary"} className="text-lg px-4 py-2">
              {isPlaying ? "🚨 TORNADO WARNING ACTIVE" : "Demo Alert Preview"}
            </Badge>
            
            <h3 className={`text-2xl font-bold ${
              isPlaying ? 'text-alert-red' : 'text-foreground'
            }`}>
              Tornado Warning in Your Area
            </h3>
            
            <p className="text-lg text-muted-foreground">
              Seek shelter immediately. Detected 12 miles southeast of your location.
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Within 50mi radius</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Active until 3:45 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className={isPlaying ? "w-4 h-4 animate-pulse" : "w-4 h-4"} />
                <span>Emergency sound {isPlaying ? "playing" : "ready"}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Demo Button */}
        <Button 
          variant={isPlaying ? "alert" : "storm"} 
          size="lg"
          onClick={handleDemoAlert}
          disabled={isPlaying}
          className="mb-8"
        >
          {isPlaying ? "Alert Active..." : "Try Demo Alert"}
        </Button>

        {/* Alert Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Volume2 className="w-8 h-8 text-storm-light mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Overrides Silent Mode</h4>
            <p className="text-sm text-muted-foreground">
              Critical alerts play at maximum volume regardless of phone settings
            </p>
          </Card>
          
          <Card className="p-6">
            <AlertTriangle className="w-8 h-8 text-alert-orange mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Instant Notifications</h4>
            <p className="text-sm text-muted-foreground">
              Get alerted within seconds of weather service warnings
            </p>
          </Card>
          
          <Card className="p-6">
            <MapPin className="w-8 h-8 text-safe mx-auto mb-3" />
            <h4 className="font-semibold mb-2">Location Precise</h4>
            <p className="text-sm text-muted-foreground">
              Only alerts you to weather affecting your specific area
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AlertDemoSection;