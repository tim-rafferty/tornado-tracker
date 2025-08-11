import { Button } from "@/components/ui/button";
import { MapPin, Shield, Smartphone } from "lucide-react";
import heroStorm from "@/assets/hero-storm.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroStorm})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-storm-light to-foreground bg-clip-text text-transparent">
            Tornado Tracker
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Stay ahead of severe weather with real-time alerts from multiple trusted sources. 
            When seconds count, we've got you covered.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border">
            <Shield className="w-12 h-12 text-storm-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Critical Alerts</h3>
            <p className="text-muted-foreground">Overrides Do Not Disturb mode for life-threatening weather</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border">
            <MapPin className="w-12 h-12 text-storm-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Custom Radius</h3>
            <p className="text-muted-foreground">Monitor severe weather within your personalized alert zone</p>
          </div>
          
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border">
            <Smartphone className="w-12 h-12 text-storm-light mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multi-Source Data</h3>
            <p className="text-muted-foreground">Aggregates from NOAA, AccuWeather, and OpenWeatherMap</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg">
            Download for iOS
          </Button>
          <Button variant="storm" size="lg">
            View Features
          </Button>
        </div>
      </div>

      {/* Animated elements */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-alert-yellow rounded-full animate-pulse opacity-70" />
      <div className="absolute bottom-32 right-16 w-6 h-6 bg-storm-light rounded-full animate-pulse opacity-50" />
      <div className="absolute top-1/3 right-8 w-3 h-3 bg-alert-orange rounded-full animate-pulse opacity-60" />
    </section>
  );
};

export default HeroSection;