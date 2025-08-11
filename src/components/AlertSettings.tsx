import { AlertSettings as AlertSettingsType } from '@/hooks/useWeatherAlerts';
import { WeatherAlert } from '@/services/weatherService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Volume2, 
  VolumeX, 
  Bell,
  BellOff,
  Wind,
  Zap,
  CloudRain,
  Snowflake,
  Cloud,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface AlertSettingsProps {
  settings: AlertSettingsType;
  onSettingsChange: (newSettings: Partial<AlertSettingsType>) => void;
}

export const AlertSettings = ({ settings, onSettingsChange }: AlertSettingsProps) => {
  const alertTypes: Array<{
    category: WeatherAlert['category'];
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      category: 'tornado',
      label: 'Tornadoes',
      description: 'Tornado warnings and watches',
      icon: <Wind className="w-4 h-4" />,
      color: 'text-alert-red'
    },
    {
      category: 'severe_thunderstorm',
      label: 'Severe Thunderstorms',
      description: 'Severe thunderstorm warnings with high winds, hail',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-alert-orange'
    },
    {
      category: 'flash_flood',
      label: 'Flash Floods',
      description: 'Flash flood warnings and watches',
      icon: <CloudRain className="w-4 h-4" />,
      color: 'text-storm-light'
    },
    {
      category: 'winter_storm',
      label: 'Winter Storms',
      description: 'Winter storm warnings, ice storms, blizzards',
      icon: <Snowflake className="w-4 h-4" />,
      color: 'text-muted-foreground'
    },
    {
      category: 'other',
      label: 'Other Weather Alerts',
      description: 'Heat warnings, wind advisories, and other alerts',
      icon: <Cloud className="w-4 h-4" />,
      color: 'text-muted-foreground'
    }
  ];

  const severityLevels = [
    { value: 'minor', label: 'Minor', description: 'All alerts including minor ones' },
    { value: 'moderate', label: 'Moderate', description: 'Moderate and above (recommended)' },
    { value: 'severe', label: 'Severe', description: 'Only severe and extreme alerts' },
    { value: 'extreme', label: 'Extreme', description: 'Only extreme/life-threatening alerts' }
  ];

  const toggleAlertType = (category: WeatherAlert['category']) => {
    const newCategories = new Set(settings.enabledCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    onSettingsChange({ enabledCategories: newCategories });
  };

  const testAlert = () => {
    if (settings.enableSound) {
      try {
        // Create a short beep sound for testing
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.error('Failed to play test sound:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Monitoring Radius */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Monitoring Radius</span>
          </CardTitle>
          <CardDescription>
            Set how far from your location to monitor for weather alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Alert Radius</Label>
              <Badge variant="outline">{settings.radius} miles</Badge>
            </div>
            <Slider
              value={[settings.radius]}
              onValueChange={(value) => onSettingsChange({ radius: value[0] })}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 miles</span>
              <span>100 miles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Types */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Types</CardTitle>
          <CardDescription>
            Choose which types of weather alerts you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alertTypes.map((alertType) => (
            <div key={alertType.category} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={alertType.color}>
                  {alertType.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{alertType.label}</h4>
                  <p className="text-xs text-muted-foreground">{alertType.description}</p>
                </div>
              </div>
              <Switch
                checked={settings.enabledCategories.has(alertType.category)}
                onCheckedChange={() => toggleAlertType(alertType.category)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Severity Threshold */}
      <Card>
        <CardHeader>
          <CardTitle>Severity Threshold</CardTitle>
          <CardDescription>
            Set the minimum severity level for alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {severityLevels.map((level) => (
            <div key={level.value} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <h4 className="font-medium text-sm capitalize">{level.label}</h4>
                <p className="text-xs text-muted-foreground">{level.description}</p>
              </div>
              <Switch
                checked={settings.severityThreshold === level.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onSettingsChange({ severityThreshold: level.value as AlertSettingsType['severityThreshold'] });
                  }
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how you receive alert notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              {settings.enableSound ? (
                <Volume2 className="w-4 h-4 text-storm-light" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label>Sound Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Play sound for critical weather alerts
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {settings.enableSound && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testAlert}
                >
                  Test
                </Button>
              )}
              <Switch
                checked={settings.enableSound}
                onCheckedChange={(checked) => onSettingsChange({ enableSound: checked })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-border rounded-lg">
            <div className="flex items-center space-x-3">
              {settings.enablePush ? (
                <Bell className="w-4 h-4 text-storm-light" />
              ) : (
                <BellOff className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label>Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Browser notifications for weather alerts
                </p>
              </div>
            </div>
            <Switch
              checked={settings.enablePush}
              onCheckedChange={(checked) => onSettingsChange({ enablePush: checked })}
            />
          </div>

          <Separator />

          <div className="bg-alert-yellow/10 border border-alert-yellow/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-alert-yellow mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium mb-1">Critical Alert Override</h4>
                <p className="text-muted-foreground">
                  Extreme weather alerts will always play sound and show notifications, 
                  regardless of your device's silent mode or notification settings. 
                  This is for your safety during life-threatening weather events.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};