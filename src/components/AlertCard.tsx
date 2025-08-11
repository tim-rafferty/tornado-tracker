import { WeatherAlert } from '@/services/weatherService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  X, 
  Zap,
  Cloud,
  CloudRain,
  Snowflake,
  Wind
} from 'lucide-react';

interface AlertCardProps {
  alert: WeatherAlert;
  onDismiss: (alertId: string) => void;
  isCritical?: boolean;
}

export const AlertCard = ({ alert, onDismiss, isCritical = false }: AlertCardProps) => {
  const getAlertIcon = (category: WeatherAlert['category']) => {
    switch (category) {
      case 'tornado': return <Wind className="w-5 h-5" />;
      case 'severe_thunderstorm': return <Zap className="w-5 h-5" />;
      case 'flash_flood': return <CloudRain className="w-5 h-5" />;
      case 'winter_storm': return <Snowflake className="w-5 h-5" />;
      default: return <Cloud className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'extreme': return 'border-alert-red bg-alert-red/10';
      case 'severe': return 'border-alert-orange bg-alert-orange/10';
      case 'moderate': return 'border-alert-yellow bg-alert-yellow/10';
      case 'minor': return 'border-storm-light bg-storm-light/10';
      default: return 'border-border bg-card';
    }
  };

  const getSeverityBadgeVariant = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'extreme':
      case 'severe':
        return 'destructive';
      case 'moderate':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const isExpired = alert.expires && new Date(alert.expires) < new Date();

  return (
    <Card className={`relative ${getSeverityColor(alert.severity)} ${isCritical ? 'animate-pulse' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isCritical ? 'bg-alert-red text-white' : 'bg-muted'}`}>
              {getAlertIcon(alert.category)}
            </div>
            <div>
              <CardTitle className="text-base leading-tight">
                {alert.title}
              </CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant={getSeverityBadgeVariant(alert.severity)}
                  className="text-xs"
                >
                  {alert.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {alert.source.toUpperCase()}
                </Badge>
                {isExpired && (
                  <Badge variant="secondary" className="text-xs">
                    EXPIRED
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(alert.id)}
            className="h-8 w-8 p-0 hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {alert.description}
        </CardDescription>

        {alert.instruction && (
          <>
            <Separator />
            <div className="bg-muted/50 p-3 rounded-md">
              <h4 className="font-medium text-sm mb-2">Instructions:</h4>
              <p className="text-sm text-muted-foreground">{alert.instruction}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Alert metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Clock className="w-3 h-3" />
            <div>
              <span className="font-medium">Effective:</span>
              <br />
              {formatDateTime(alert.effective)}
            </div>
          </div>

          {alert.expires && (
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <div>
                <span className="font-medium">Expires:</span>
                <br />
                {formatDateTime(alert.expires)}
              </div>
            </div>
          )}

          {alert.areas.length > 0 && (
            <div className="flex items-start space-x-2 sm:col-span-2">
              <MapPin className="w-3 h-3 mt-0.5" />
              <div>
                <span className="font-medium">Areas:</span>
                <br />
                {alert.areas.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Urgency and certainty */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <span className="font-medium">Urgency:</span>
            <Badge variant="outline" className="text-xs">
              {alert.urgency}
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-medium">Certainty:</span>
            <Badge variant="outline" className="text-xs">
              {alert.certainty}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};