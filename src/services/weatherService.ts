import { LocationData } from '@/hooks/useLocation';
import { 
  NWSAlertsResponseSchema, 
  NWSObservationSchema, 
  sanitizeString, 
  sanitizeNumber,
  RateLimiter 
} from '@/lib/validation';

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
  private rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

  async getActiveAlerts(location: LocationData): Promise<WeatherAlert[]> {
    try {
      // Rate limiting check
      const rateLimitKey = `alerts_${location.latitude}_${location.longitude}`;
      if (!this.rateLimiter.canMakeRequest(rateLimitKey)) {
        throw new Error('Rate limit exceeded for weather alerts');
      }

      // Get active alerts for the location
      const response = await fetch(
        `${this.baseUrl}/alerts/active?point=${location.latitude},${location.longitude}`
      );

      if (!response.ok) {
        throw new Error(`NWS API error: ${response.status}`);
      }

      const rawData = await response.json();
      
      // Validate API response structure
      const validatedData = NWSAlertsResponseSchema.parse(rawData);
      
      return validatedData.features?.map((alert) => ({
        id: sanitizeString(alert.id, 100),
        title: sanitizeString(alert.properties.headline || alert.properties.event, 200),
        description: sanitizeString(alert.properties.description, 2000),
        severity: this.mapSeverity(alert.properties.severity),
        urgency: this.mapUrgency(alert.properties.urgency),
        certainty: this.mapCertainty(alert.properties.certainty),
        category: this.categorizeAlert(alert.properties.event),
        areas: this.parseAreas(alert.properties.areaDesc),
        effective: sanitizeString(alert.properties.effective, 50),
        expires: sanitizeString(alert.properties.expires, 50),
        onset: sanitizeString(alert.properties.onset, 50),
        instruction: sanitizeString(alert.properties.instruction, 1000),
        source: 'nws' as const,
        coordinates: {
          latitude: sanitizeNumber(location.latitude, 0, -90, 90),
          longitude: sanitizeNumber(location.longitude, 0, -180, 180)
        }
      })) || [];
    } catch (error) {
      console.error('Failed to fetch NWS alerts:', error);
      throw error;
    }
  }

  async getCurrentConditions(location: LocationData): Promise<WeatherConditions | null> {
    try {
      // Rate limiting check
      const rateLimitKey = `conditions_${location.latitude}_${location.longitude}`;
      if (!this.rateLimiter.canMakeRequest(rateLimitKey)) {
        throw new Error('Rate limit exceeded for weather conditions');
      }

      // First get the grid point for the location
      const pointResponse = await fetch(
        `${this.baseUrl}/points/${location.latitude},${location.longitude}`
      );

      if (!pointResponse.ok) {
        throw new Error(`NWS Point API error: ${pointResponse.status}`);
      }

      const pointData = await pointResponse.json();
      const stationsUrl = sanitizeString(pointData.properties?.observationStations, 200);
      
      if (!stationsUrl) {
        throw new Error('No observation stations URL found');
      }

      // Get nearest weather station
      const stationsResponse = await fetch(stationsUrl);
      const stationsData = await stationsResponse.json();
      
      if (!stationsData.features?.length) {
        throw new Error('No weather stations found');
      }

      const stationId = sanitizeString(stationsData.features[0].properties?.stationIdentifier, 20);
      if (!stationId) {
        throw new Error('No valid station identifier found');
      }
      
      // Get latest observation
      const obsResponse = await fetch(
        `${this.baseUrl}/stations/${stationId}/observations/latest`
      );

      if (!obsResponse.ok) {
        throw new Error(`NWS Observation API error: ${obsResponse.status}`);
      }

      const rawObsData = await obsResponse.json();
      
      // Validate observation data
      const validatedData = NWSObservationSchema.parse(rawObsData);
      const props = validatedData.properties;

      return {
        temperature: sanitizeNumber(this.celsiusToFahrenheit(props.temperature?.value), 0, -100, 150),
        humidity: sanitizeNumber(props.relativeHumidity?.value, 0, 0, 100),
        windSpeed: sanitizeNumber(this.mpsToMph(props.windSpeed?.value), 0, 0, 300),
        windDirection: sanitizeNumber(props.windDirection?.value, 0, 0, 360),
        pressure: sanitizeNumber(props.barometricPressure?.value, 0, 800, 1200),
        visibility: sanitizeNumber(this.metersToMiles(props.visibility?.value), 0, 0, 50),
        conditions: sanitizeString(props.textDescription, 100) || 'Unknown',
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to fetch NWS conditions:', error);
      return null;
    }
  }

  private mapSeverity(severity: string | undefined): WeatherAlert['severity'] {
    const severityStr = sanitizeString(severity, 20).toLowerCase();
    switch (severityStr) {
      case 'extreme': return 'extreme';
      case 'severe': return 'severe';
      case 'moderate': return 'moderate';
      case 'minor': return 'minor';
      default: return 'moderate';
    }
  }

  private mapUrgency(urgency: string | undefined): WeatherAlert['urgency'] {
    const urgencyStr = sanitizeString(urgency, 20).toLowerCase();
    switch (urgencyStr) {
      case 'immediate': return 'immediate';
      case 'expected': return 'expected';
      case 'future': return 'future';
      case 'past': return 'past';
      default: return 'future';
    }
  }

  private mapCertainty(certainty: string | undefined): WeatherAlert['certainty'] {
    const certaintyStr = sanitizeString(certainty, 20).toLowerCase();
    switch (certaintyStr) {
      case 'observed': return 'observed';
      case 'likely': return 'likely';
      case 'possible': return 'possible';
      case 'unlikely': return 'unlikely';
      default: return 'unknown';
    }
  }

  private categorizeAlert(event: string | undefined): WeatherAlert['category'] {
    const eventLower = sanitizeString(event, 100).toLowerCase();
    
    if (eventLower.includes('tornado')) return 'tornado';
    if (eventLower.includes('thunderstorm') || eventLower.includes('severe')) return 'severe_thunderstorm';
    if (eventLower.includes('flood') || eventLower.includes('flash')) return 'flash_flood';
    if (eventLower.includes('winter') || eventLower.includes('snow') || eventLower.includes('ice')) return 'winter_storm';
    
    return 'other';
  }

  private parseAreas(areaDesc: string | undefined): string[] {
    const sanitized = sanitizeString(areaDesc, 500);
    if (!sanitized) return [];
    
    return sanitized
      .split(';')
      .map(area => sanitizeString(area.trim(), 100))
      .filter(area => area.length > 0)
      .slice(0, 20); // Limit to 20 areas max
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