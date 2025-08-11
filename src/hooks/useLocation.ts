import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { LocationDataSchema, validateAndSanitizeStoredData, sanitizeNumber } from '@/lib/validation';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface LocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const useLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    permissionStatus: 'unknown'
  });

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      setState(prev => ({ ...prev, error, loading: false }));
      toast({
        title: "Location Error",
        description: error,
        variant: "destructive"
      });
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const locationData: LocationData = {
        latitude: sanitizeNumber(position.coords.latitude, position.coords.latitude, -90, 90),
        longitude: sanitizeNumber(position.coords.longitude, position.coords.longitude, -180, 180),
        accuracy: position.coords.accuracy ? sanitizeNumber(position.coords.accuracy, undefined, 0, 50000) : undefined,
        timestamp: Date.now()
      };

      // Validate the location data before using - cast to LocationData since schema ensures correct structure
      const validatedLocation = LocationDataSchema.parse(locationData) as LocationData;

      setState(prev => ({
        ...prev,
        location: validatedLocation,
        loading: false,
        permissionStatus: 'granted'
      }));

      // Store in localStorage for persistence
      try {
        localStorage.setItem('tornadoTracker_location', JSON.stringify(validatedLocation));
      } catch (error) {
        console.warn('Failed to store location data:', error);
      }

      return validatedLocation;
    } catch (error: any) {
      let errorMessage = 'Failed to get your location';
      let permissionStatus: LocationState['permissionStatus'] = 'unknown';

      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location access denied. Please enable location services.';
        permissionStatus = 'denied';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location information unavailable';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out';
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        permissionStatus
      }));

      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  };

  const loadStoredLocation = () => {
    const fallbackLocation = null;
    
    const locationData = validateAndSanitizeStoredData(
      'tornadoTracker_location',
      LocationDataSchema,
      fallbackLocation
    );
    
    if (locationData) {
      // Check if stored location is less than 1 hour old
      if (Date.now() - locationData.timestamp < 3600000) {
        setState(prev => ({
          ...prev,
          location: locationData,
          permissionStatus: 'granted'
        }));
        return locationData;
      } else {
        // Remove stale location data
        localStorage.removeItem('tornadoTracker_location');
      }
    }
    
    return null;
  };

  useEffect(() => {
    loadStoredLocation();
  }, []);

  return {
    ...state,
    getCurrentLocation,
    loadStoredLocation
  };
};