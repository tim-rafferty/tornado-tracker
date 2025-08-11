import { LocationData } from '@/hooks/useLocation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Navigation,
  Globe
} from 'lucide-react';

interface LocationSettingsProps {
  location: LocationData | null;
  onLocationUpdate: () => void;
  loading: boolean;
  error: string | null;
}

export const LocationSettings = ({ 
  location, 
  onLocationUpdate, 
  loading, 
  error 
}: LocationSettingsProps) => {
  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W');
    return `${Math.abs(coord).toFixed(6)}° ${direction}`;
  };

  const formatAccuracy = (accuracy?: number) => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 100) return `${Math.round(accuracy)}m (Excellent)`;
    if (accuracy < 500) return `${Math.round(accuracy)}m (Good)`;
    if (accuracy < 1000) return `${Math.round(accuracy)}m (Fair)`;
    return `${Math.round(accuracy)}m (Poor)`;
  };

  const getLocationAge = (timestamp: number) => {
    const ageMs = Date.now() - timestamp;
    const ageMinutes = Math.floor(ageMs / 60000);
    
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 60) return `${ageMinutes} minute${ageMinutes > 1 ? 's' : ''} ago`;
    
    const ageHours = Math.floor(ageMinutes / 60);
    return `${ageHours} hour${ageHours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Current Location</span>
          </CardTitle>
          <CardDescription>
            Your location is used to fetch weather alerts for your area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-alert-red/10 border border-alert-red/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-alert-red mt-0.5" />
              <div>
                <h4 className="font-medium text-alert-red">Location Error</h4>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
                <Button 
                  size="sm" 
                  onClick={onLocationUpdate}
                  disabled={loading}
                  className="mt-3"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Enable Location Access
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {location && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-safe" />
                <span className="font-medium">Location Access Enabled</span>
                <Badge variant="outline">Active</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h4 className="font-medium text-sm mb-2">Coordinates</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Lat: {formatCoordinate(location.latitude, 'lat')}</p>
                    <p>Lng: {formatCoordinate(location.longitude, 'lng')}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2">Accuracy</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{formatAccuracy(location.accuracy)}</p>
                    <p>Updated: {getLocationAge(location.timestamp)}</p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                onClick={onLocationUpdate}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating Location...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Location
                  </>
                )}
              </Button>
            </div>
          )}

          {!location && !error && (
            <div className="text-center py-8">
              <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Location Required</h3>
              <p className="text-muted-foreground text-sm mb-4">
                To receive weather alerts, we need access to your location.
              </p>
              <Button onClick={onLocationUpdate} disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Get My Location
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>
            How we handle your location data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-safe mt-0.5" />
            <span>Location data is stored only on your device</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-safe mt-0.5" />
            <span>No personal data is transmitted to third parties</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-safe mt-0.5" />
            <span>Location is only used to fetch local weather alerts</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-safe mt-0.5" />
            <span>You can disable location access at any time</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};