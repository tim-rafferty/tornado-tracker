import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WeatherAlert, weatherService } from '@/services/weatherService';
import { LocationData } from './useLocation';
import { toast } from '@/hooks/use-toast';
import { AlertSettingsSchema, validateAndSanitizeStoredData, sanitizeNumber } from '@/lib/validation';

export interface AlertSettings {
  radius: number; // miles
  enabledCategories: Set<WeatherAlert['category']>;
  enableSound: boolean;
  enablePush: boolean;
  severityThreshold: WeatherAlert['severity'];
}

const DEFAULT_SETTINGS: AlertSettings = {
  radius: 25,
  enabledCategories: new Set(['tornado', 'severe_thunderstorm', 'flash_flood']),
  enableSound: true,
  enablePush: true,
  severityThreshold: 'moderate'
};

// Helper to convert settings for storage/validation
const settingsToStorable = (settings: AlertSettings) => ({
  ...settings,
  enabledCategories: Array.from(settings.enabledCategories)
});

const storableToSettings = (storable: any): AlertSettings => ({
  ...DEFAULT_SETTINGS,
  ...storable,
  enabledCategories: new Set(storable.enabledCategories || DEFAULT_SETTINGS.enabledCategories)
});

export const useWeatherAlerts = (location: LocationData | null) => {
  const [settings, setSettings] = useState<AlertSettings>(() => {
    const validatedSettings = validateAndSanitizeStoredData(
      'tornadoTracker_alertSettings',
      AlertSettingsSchema,
      settingsToStorable(DEFAULT_SETTINGS)
    );
    
    return storableToSettings(validatedSettings);
  });

  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('tornadoTracker_dismissedAlerts');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate that it's an array of strings
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string' && item.length > 0)) {
          return new Set(parsed.slice(0, 1000)); // Limit to 1000 dismissed alerts
        }
      }
    } catch (error) {
      console.warn('Failed to load dismissed alerts:', error);
      localStorage.removeItem('tornadoTracker_dismissedAlerts');
    }
    return new Set();
  });

  // Query for active alerts
  const {
    data: alerts = [],
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['weather-alerts', location?.latitude, location?.longitude],
    queryFn: () => location ? weatherService.getActiveAlerts(location) : Promise.resolve([]),
    enabled: !!location,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchIntervalInBackground: true,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
  });

  // Filter alerts based on settings
  const filteredAlerts = alerts.filter(alert => {
    // Check if alert category is enabled
    if (!settings.enabledCategories.has(alert.category)) return false;
    
    // Check severity threshold
    const severityLevels = { minor: 1, moderate: 2, severe: 3, extreme: 4 };
    const alertLevel = severityLevels[alert.severity];
    const thresholdLevel = severityLevels[settings.severityThreshold];
    if (alertLevel < thresholdLevel) return false;

    // Check if alert is dismissed
    if (dismissedAlerts.has(alert.id)) return false;

    return true;
  });

  // Separate critical alerts (extreme/severe)
  const criticalAlerts = filteredAlerts.filter(alert => 
    alert.severity === 'extreme' || alert.severity === 'severe'
  );

  // Play alert sound for new critical alerts
  useEffect(() => {
    if (!settings.enableSound || criticalAlerts.length === 0) return;

    const newCriticalAlerts = criticalAlerts.filter(alert => {
      const stored = localStorage.getItem(`alert_${alert.id}_notified`);
      return !stored;
    });

    if (newCriticalAlerts.length > 0) {
      // Mark alerts as notified
      newCriticalAlerts.forEach(alert => {
        localStorage.setItem(`alert_${alert.id}_notified`, 'true');
      });

      // Play alert sound
      try {
        const audio = new Audio('/alert-sound.mp3'); // We'll need to add this sound file
        audio.volume = 1.0;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play alert sound:', error);
      }

      // Show toast notification
      newCriticalAlerts.forEach(alert => {
        toast({
          title: `🚨 ${alert.title}`,
          description: alert.description.slice(0, 100) + '...',
          variant: "destructive",
          duration: 10000
        });
      });
    }
  }, [criticalAlerts, settings.enableSound]);

  const updateSettings = useCallback((newSettings: Partial<AlertSettings>) => {
    const updated = { ...settings, ...newSettings };
    
    // Sanitize radius value
    if (newSettings.radius !== undefined) {
      updated.radius = sanitizeNumber(newSettings.radius, 25, 1, 1000);
    }
    
    setSettings(updated);
    
    try {
      const toStore = settingsToStorable(updated);
      // Validate before storing
      AlertSettingsSchema.parse(toStore);
      localStorage.setItem('tornadoTracker_alertSettings', JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save alert settings:', error);
      toast({
        title: "Settings Error",
        description: "Failed to save alert settings",
        variant: "destructive"
      });
    }
  }, [settings]);

  const dismissAlert = useCallback((alertId: string) => {
    // Validate alert ID
    if (!alertId || typeof alertId !== 'string' || alertId.length > 100) {
      console.warn('Invalid alert ID provided for dismissal');
      return;
    }
    
    const updated = new Set(dismissedAlerts);
    updated.add(alertId);
    
    // Limit dismissed alerts to prevent excessive memory usage
    if (updated.size > 1000) {
      const alertsArray = Array.from(updated);
      const trimmed = new Set(alertsArray.slice(-900)); // Keep most recent 900
      setDismissedAlerts(trimmed);
      
      try {
        localStorage.setItem('tornadoTracker_dismissedAlerts', JSON.stringify(Array.from(trimmed)));
      } catch (error) {
        console.error('Failed to save dismissed alerts:', error);
      }
    } else {
      setDismissedAlerts(updated);
      
      try {
        localStorage.setItem('tornadoTracker_dismissedAlerts', JSON.stringify(Array.from(updated)));
      } catch (error) {
        console.error('Failed to save dismissed alerts:', error);
      }
    }
  }, [dismissedAlerts]);

  const clearDismissed = useCallback(() => {
    setDismissedAlerts(new Set());
    localStorage.removeItem('tornadoTracker_dismissedAlerts');
  }, []);

  return {
    alerts: filteredAlerts,
    criticalAlerts,
    allAlerts: alerts,
    isLoading,
    error,
    settings,
    updateSettings,
    dismissAlert,
    clearDismissed,
    refetch
  };
};