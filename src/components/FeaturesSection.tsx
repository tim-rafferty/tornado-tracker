import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  MapPin, 
  Cloud, 
  History, 
  Volume2, 
  Radar,
  Tornado,
  CloudRain,
  Zap
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Bell,
      title: "Critical Alert System",
      description: "Breaks through Do Not Disturb and silent mode with loud emergency alarms",
      tag: "Life-Saving"
    },
    {
      icon: MapPin,
      title: "Customizable Alert Radius", 
      description: "Set your monitoring zone from 5-100 miles around your location",
      tag: "Personalized"
    },
    {
      icon: Cloud,
      title: "Multi-Source Aggregation",
      description: "Cross-references data from NOAA, AccuWeather, and OpenWeatherMap",
      tag: "Reliable"
    },
    {
      icon: Radar,
      title: "Interactive Weather Map",
      description: "Real-time radar overlay showing storm systems and warning zones",
      tag: "Visual"
    },
    {
      icon: Volume2,
      title: "Background Monitoring",
      description: "Continuous scanning every 5-15 minutes without draining battery",
      tag: "Efficient"
    },
    {
      icon: History,
      title: "Alert History",
      description: "Track past warnings and learn about weather patterns in your area",
      tag: "Educational"
    }
  ];

  const weatherTypes = [
    { icon: Tornado, name: "Tornado", color: "text-alert-red" },
    { icon: Zap, name: "Severe Thunderstorm", color: "text-alert-orange" },
    { icon: CloudRain, name: "Flash Flood", color: "text-alert-yellow" },
    { icon: Cloud, name: "Hurricane", color: "text-storm-light" }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Advanced Weather Protection
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive system monitors multiple severe weather threats 
            and delivers instant alerts when danger approaches your location.
          </p>
        </div>

        {/* Weather Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {weatherTypes.map((weather, index) => (
            <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
              <weather.icon className={`w-12 h-12 mx-auto mb-3 ${weather.color}`} />
              <h3 className="font-semibold">{weather.name}</h3>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 group">
              <div className="mb-4 flex items-center justify-between">
                <feature.icon className="w-10 h-10 text-storm-light group-hover:text-storm transition-colors" />
                <Badge variant="secondary" className="text-xs">
                  {feature.tag}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;