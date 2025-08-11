import { LocationData } from '@/hooks/useLocation';

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  urgency: 'immediate' | 'expected' | 'future' | 'past';
  certainty: 'observed' | 'likely' | 'possible' | 'unlikely' | 'unknown';
  category: 'tornado' | 'severe_thunderstorm' | 'flash_flood' | 'winter_storm' | 'other';
  areas: string[];
  effective: string;
  expires?: string;
  onset?: string;
  instruction?: string;
  source: 'nws' | 'openweather' | 'accuweather';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherConditions {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  conditions: string;
  timestamp: number;
}

// National Weather Service API (Free, no API key required)
export class NWSWeatherService {
  private baseUrl = 'https://api.weather.gov';

  async getActiveAlerts(location: LocationData): Promise<WeatherAlert[]> {
    try {
      // Get active alerts for the location
      const response = await fetch(
        `${this.baseUrl}/alerts/active?point=${location.latitude},${location.longitude}`
      );

      if (!response.ok) {
        throw new Error(`NWS API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.features?.map((alert: any) => ({
        id: alert.id,
        title: alert.properties.headline || alert.properties.event,
        description: alert.properties.description,
        severity: this.mapSeverity(alert.properties.severity),
        urgency: alert.properties.urgency?.toLowerCase() || 'unknown',
        certainty: alert.properties.certainty?.toLowerCase() || 'unknown',
        category: this.categorizeAlert(alert.properties.event),
        areas: alert.properties.areaDesc?.split('; ') || [],
        effective: alert.properties.effective,
        expires: alert.properties.expires,
        onset: alert.properties.onset,
        instruction: alert.properties.instruction,
        source: 'nws' as const,
        coordinates: {
          latitude: location.latitude,
          longitude: location.longitude
        }
      })) || [];
    } catch (error) {
      console.error('Failed to fetch NWS alerts:', error);
      throw error;
    }
  }

  async getCurrentConditions(location: LocationData): Promise<WeatherConditions | null> {
    try {
      // First get the grid point for the location
      const pointResponse = await fetch(
        `${this.baseUrl}/points/${location.latitude},${location.longitude}`
      );

      if (!pointResponse.ok) {
        throw new Error(`NWS Point API error: ${pointResponse.status}`);
      }

      const pointData = await pointResponse.json();
      const stationsUrl = pointData.properties.observationStations;

      // Get nearest weather station
      const stationsResponse = await fetch(stationsUrl);
      const stationsData = await stationsResponse.json();
      
      if (!stationsData.features?.length) {
        throw new Error('No weather stations found');
      }

      const stationId = stationsData.features[0].properties.stationIdentifier;
      
      // Get latest observation
      const obsResponse = await fetch(
        `${this.baseUrl}/stations/${stationId}/observations/latest`
      );

      if (!obsResponse.ok) {
        throw new Error(`NWS Observation API error: ${obsResponse.status}`);
      }

      const obsData = await obsResponse.json();
      const props = obsData.properties;

      return {
        temperature: this.celsiusToFahrenheit(props.temperature?.value) || 0,
        humidity: props.relativeHumidity?.value || 0,
        windSpeed: this.mpsToMph(props.windSpeed?.value) || 0,
        windDirection: props.windDirection?.value || 0,
        pressure: props.barometricPressure?.value || 0,
        visibility: this.metersToMiles(props.visibility?.value) || 0,
        conditions: props.textDescription || 'Unknown',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch NWS conditions:', error);
      return null;
    }
  }

  private mapSeverity(severity: string): WeatherAlert['severity'] {
    switch (severity?.toLowerCase()) {
      case 'extreme': return 'extreme';
      case 'severe': return 'severe';
      case 'moderate': return 'moderate';
      case 'minor': return 'minor';
      default: return 'moderate';
    }
  }

  private categorizeAlert(event: string): WeatherAlert['category'] {
    const eventLower = event?.toLowerCase() || '';
    
    if (eventLower.includes('tornado')) return 'tornado';
    if (eventLower.includes('thunderstorm') || eventLower.includes('severe')) return 'severe_thunderstorm';
    if (eventLower.includes('flood') || eventLower.includes('flash')) return 'flash_flood';
    if (eventLower.includes('winter') || eventLower.includes('snow') || eventLower.includes('ice')) return 'winter_storm';
    
    return 'other';
  }

  private celsiusToFahrenheit(celsius: number): number {
    return celsius * 9/5 + 32;
  }

  private mpsToMph(mps: number): number {
    return mps * 2.237;
  }

  private metersToMiles(meters: number): number {
    return meters * 0.000621371;
  }
}

export const weatherService = new NWSWeatherService();