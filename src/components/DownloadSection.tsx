import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Shield, Star } from "lucide-react";

const DownloadSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Coming Soon to App Store
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Download Tornado Tracker
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of users who trust Tornado Tracker to keep them safe 
            from severe weather threats. Available for iOS 16+.
          </p>
        </div>

        {/* Download Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* iOS Card */}
          <Card className="p-8 text-center">
            <Smartphone className="w-16 h-16 text-storm-light mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">iOS App</h3>
            <p className="text-muted-foreground mb-6">
              Full-featured app with critical alerts, background monitoring, 
              and interactive weather maps.
            </p>
            <Button variant="hero" size="lg" className="w-full mb-4">
              Download from App Store
            </Button>
            <p className="text-sm text-muted-foreground">Requires iOS 16.0 or later</p>
          </Card>

          {/* Features Card */}
          <Card className="p-8">
            <Shield className="w-16 h-16 text-safe mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-6 text-center">What's Included</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Critical alert override system</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Multi-source weather data</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Customizable alert radius</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Interactive radar maps</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Background monitoring</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-storm-light" />
                <span>Alert history tracking</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-storm-light mb-2">4</div>
            <div className="text-muted-foreground">Data Sources</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-storm-light mb-2">100</div>
            <div className="text-muted-foreground">Mile Radius</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-storm-light mb-2">24/7</div>
            <div className="text-muted-foreground">Monitoring</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-storm-light mb-2">&lt;5s</div>
            <div className="text-muted-foreground">Alert Speed</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;