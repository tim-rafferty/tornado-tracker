import { z } from 'zod';

// API Response Validation Schemas
export const NWSAlertSchema = z.object({
  id: z.string().min(1),
  properties: z.object({
    headline: z.string().optional(),
    event: z.string().min(1),
    description: z.string().min(1),
    severity: z.string().optional(),
    urgency: z.string().optional(),
    certainty: z.string().optional(),
    areaDesc: z.string().optional(),
    effective: z.string().min(1),
    expires: z.string().optional(),
    onset: z.string().optional(),
    instruction: z.string().optional()
  })
});

export const NWSAlertsResponseSchema = z.object({
  features: z.array(NWSAlertSchema).optional()
});

export const NWSObservationSchema = z.object({
  properties: z.object({
    temperature: z.object({ value: z.number().nullable() }).optional(),
    relativeHumidity: z.object({ value: z.number().nullable() }).optional(),
    windSpeed: z.object({ value: z.number().nullable() }).optional(),
    windDirection: z.object({ value: z.number().nullable() }).optional(),
    barometricPressure: z.object({ value: z.number().nullable() }).optional(),
    visibility: z.object({ value: z.number().nullable() }).optional(),
    textDescription: z.string().optional()
  })
});

// LocalStorage Data Schemas
export const LocationDataSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: z.number().positive()
}).strict();

export const AlertSettingsSchema = z.object({
  radius: z.number().positive().max(1000),
  enabledCategories: z.array(z.enum(['tornado', 'severe_thunderstorm', 'flash_flood', 'winter_storm', 'other'])),
  enableSound: z.boolean(),
  enablePush: z.boolean(),
  severityThreshold: z.enum(['minor', 'moderate', 'severe', 'extreme'])
});

// Sanitization utilities
export const sanitizeString = (input: string | undefined | null, maxLength = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and limit length
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, maxLength)
    .trim();
};

export const sanitizeNumber = (input: any, fallback = 0, min?: number, max?: number): number => {
  const num = typeof input === 'number' ? input : Number(input);
  
  if (isNaN(num) || !isFinite(num)) return fallback;
  
  if (min !== undefined && num < min) return fallback;
  if (max !== undefined && num > max) return fallback;
  
  return num;
};

// Validation utilities
export const validateAndSanitizeStoredData = <T>(
  key: string,
  schema: z.ZodSchema<T>,
  fallback: T
): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    
    const parsed = JSON.parse(stored);
    const validated = schema.parse(parsed);
    
    return validated;
  } catch (error) {
    console.warn(`Invalid stored data for ${key}, using fallback:`, error);
    // Clear invalid data
    localStorage.removeItem(key);
    return fallback;
  }
};

// Rate limiting utility
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 60,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the time window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingRequests(key: string): number {
    const requests = this.requests.get(key) || [];
    const now = Date.now();
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}