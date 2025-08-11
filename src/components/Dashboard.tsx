import { useState } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { useWeatherAlerts } from '@/hooks/useWeatherAlerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  Shield, 
  Clock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { AlertCard } from './AlertCard';
import { LocationSettings } from './LocationSettings';
import { AlertSettings } from './AlertSettings';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'location' | 'settings'>('alerts');
  const { location, loading: locationLoading, error: locationError, getCurrentLocation } = useLocation();
  const { 
    alerts, 
    criticalAlerts, 
    isLoading: alertsLoading, 
    error: alertsError, 
    settings,
    updateSettings,
    dismissAlert,
    refetch 
  } = useWeatherAlerts(location);

  const handleRefresh = () => {
    if (location) {
      refetch();
    } else {
      getCurrentLocation();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-alert-red';
      case 'severe': return 'bg-alert-orange';
      case 'moderate': return 'bg-alert-yellow';
      case 'minor': return 'bg-storm-light';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">Tornado Tracker</h1>
              {location && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-xs">
                    {location.latitude.toFixed(2)}, {location.longitude.toFixed(2)}
                  </span>
                </Badge>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Sound toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateSettings({ enableSound: !settings.enableSound })}
                className="flex items-center space-x-1"
              >
                {settings.enableSound ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>

              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={locationLoading || alertsLoading}
                className="flex items-center space-x-1"
              >
                <RefreshCw className={`w-4 h-4 ${(locationLoading || alertsLoading) ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Location Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Location Status</CardTitle>
            </CardHeader>
            <CardContent>
              {locationError ? (
                <div className="text-alert-red">
                  <AlertTriangle className="w-5 h-5 mb-2" />
                  <p className="text-sm">{locationError}</p>
                  <Button size="sm" onClick={getCurrentLocation} className="mt-2">
                    Enable Location
                  </Button>
                </div>
              ) : location ? (
                <div className="text-safe">
                  <Shield className="w-5 h-5 mb-2" />
                  <p className="text-sm">Location tracking active</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.radius} mile monitoring radius
                  </p>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Clock className="w-5 h-5 mb-2" />
                  <p className="text-sm">Getting location...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">
                {criticalAlerts.length} critical
              </p>
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="mt-2">
                  Emergency Active
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p>{Array.from(settings.enabledCategories).length} alert types</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {settings.severityThreshold}+ severity
                </p>
                <p className="text-xs text-muted-foreground">
                  Sound: {settings.enableSound ? 'On' : 'Off'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 border-b border-border">
          {[
            { id: 'alerts', label: 'Active Alerts', count: alerts.length },
            { id: 'location', label: 'Location' },
            { id: 'settings', label: 'Alert Settings' }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-2"
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'alerts' && (
            <div>
              {alertsError && (
                <Card className="mb-4 border-alert-red">
                  <CardHeader>
                    <CardTitle className="text-alert-red">Weather Service Error</CardTitle>
                    <CardDescription>
                      Failed to fetch weather alerts. Please check your internet connection.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {alertsLoading && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading weather alerts...</span>
                  </CardContent>
                </Card>
              )}

              {!alertsLoading && alerts.length === 0 && !alertsError && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Shield className="w-12 h-12 text-safe mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">All Clear</h3>
                      <p className="text-muted-foreground">
                        No active weather alerts in your area
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Critical Alerts First */}
              {criticalAlerts.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-alert-red mb-4">🚨 Critical Alerts</h2>
                  <div className="space-y-4 mb-8">
                    {criticalAlerts.map((alert) => (
                      <AlertCard
                        key={alert.id}
                        alert={alert}
                        onDismiss={dismissAlert}
                        isCritical={true}
                      />
                    ))}
                  </div>
                  <Separator className="my-8" />
                </>
              )}

              {/* Regular Alerts */}
              {alerts.filter(alert => alert.severity !== 'extreme' && alert.severity !== 'severe').length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">Other Alerts</h2>
                  <div className="space-y-4">
                    {alerts
                      .filter(alert => alert.severity !== 'extreme' && alert.severity !== 'severe')
                      .map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onDismiss={dismissAlert}
                          isCritical={false}
                        />
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'location' && (
            <LocationSettings 
              location={location} 
              onLocationUpdate={getCurrentLocation}
              loading={locationLoading}
              error={locationError}
            />
          )}

          {activeTab === 'settings' && (
            <AlertSettings 
              settings={settings}
              onSettingsChange={updateSettings}
            />
          )}
        </div>
      </div>
    </div>
  );
};