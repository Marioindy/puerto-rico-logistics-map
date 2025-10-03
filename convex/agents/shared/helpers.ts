/**
 * Shared Helper Utilities for Agent Tools
 *
 * This module contains reusable utility functions used across
 * both Fabiola and Jaynette agent tools.
 *
 * Benefits of modularity:
 * - DRY (Don't Repeat Yourself)
 * - Consistent behavior across tools
 * - Easier testing and maintenance
 * - Single source of truth for calculations
 */

import type { Coordinates } from "@/agents/lib/types";

/**
 * Puerto Rico geographic bounds for validation
 */
export const PUERTO_RICO_BOUNDS = {
  lat: { min: 17.5, max: 18.6 },
  lng: { min: -67.5, max: -65.0 },
} as const;

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate
 * @returns Distance in kilometers
 *
 * @example
 * const distance = calculateDistance(
 *   { lat: 18.4, lng: -66.0 },
 *   { lat: 18.3, lng: -66.1 }
 * );
 * console.log(`${distance.toFixed(1)} km`);
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate if coordinates are within Puerto Rico bounds
 *
 * @param coordinates - Coordinate object to validate
 * @returns True if coordinates are within Puerto Rico
 *
 * @example
 * if (!isValidPuertoRicoCoordinates(coords)) {
 *   throw new Error("Coordinates must be within Puerto Rico");
 * }
 */
export function isValidPuertoRicoCoordinates(coordinates: Coordinates): boolean {
  return (
    coordinates.lat >= PUERTO_RICO_BOUNDS.lat.min &&
    coordinates.lat <= PUERTO_RICO_BOUNDS.lat.max &&
    coordinates.lng >= PUERTO_RICO_BOUNDS.lng.min &&
    coordinates.lng <= PUERTO_RICO_BOUNDS.lng.max
  );
}

/**
 * Validate coordinates and throw descriptive error if invalid
 *
 * @param coordinates - Coordinates to validate
 * @param fieldName - Name of the field for error message
 * @throws Error with helpful message if coordinates are invalid
 */
export function validateCoordinates(
  coordinates: Coordinates,
  fieldName: string = "Coordinates"
): void {
  if (!isValidPuertoRicoCoordinates(coordinates)) {
    throw new Error(
      `${fieldName} (${coordinates.lat}, ${coordinates.lng}) are outside Puerto Rico bounds. ` +
      `Valid range: Latitude ${PUERTO_RICO_BOUNDS.lat.min} to ${PUERTO_RICO_BOUNDS.lat.max}, ` +
      `Longitude ${PUERTO_RICO_BOUNDS.lng.min} to ${PUERTO_RICO_BOUNDS.lng.max}`
    );
  }
}

/**
 * Format distance for display
 *
 * @param km - Distance in kilometers
 * @returns Formatted string with appropriate unit
 *
 * @example
 * formatDistance(0.5) // "500m"
 * formatDistance(2.3) // "2.3km"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Valid facility types in the system
 */
export const FACILITY_TYPES = [
  "warehouse",
  "port",
  "airport",
  "facility",
] as const;

export type FacilityType = typeof FACILITY_TYPES[number];

/**
 * Validate facility type
 *
 * @param type - Type string to validate
 * @returns True if type is valid
 */
export function isValidFacilityType(type: string): type is FacilityType {
  return FACILITY_TYPES.includes(type as FacilityType);
}

/**
 * Valid regions in Puerto Rico
 */
export const REGIONS = [
  "north",
  "south",
  "east",
  "west",
  "central",
] as const;

export type Region = typeof REGIONS[number];

/**
 * Validate region
 *
 * @param region - Region string to validate
 * @returns True if region is valid
 */
export function isValidRegion(region: string): region is Region {
  return REGIONS.includes(region as Region);
}

/**
 * Sanitize search input to prevent injection
 *
 * @param input - User-provided search string
 * @returns Sanitized search string
 */
export function sanitizeSearchInput(input: string): string {
  // Remove leading/trailing whitespace
  let sanitized = input.trim();

  // Limit length
  const maxLength = 200;
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Remove potentially problematic characters
  // Keep alphanumeric, spaces, and common punctuation
  sanitized = sanitized.replace(/[^\w\s\-.,áéíóúñÁÉÍÓÚÑüÜ]/g, '');

  return sanitized;
}

/**
 * Group array of items by a key
 *
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Object with grouped items
 *
 * @example
 * const facilities = [...];
 * const byType = groupBy(facilities, 'type');
 * // { warehouse: [...], port: [...] }
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Count items by a key
 *
 * @param array - Array to count
 * @param key - Key to count by
 * @returns Object with counts
 *
 * @example
 * const facilities = [...];
 * const countByType = countBy(facilities, 'type');
 * // { warehouse: 5, port: 2, airport: 1 }
 */
export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce((result, item) => {
    const countKey = String(item[key] || 'unknown');
    result[countKey] = (result[countKey] || 0) + 1;
    return result;
  }, {} as Record<string, number>);
}

/**
 * Generate a cryptographically secure random token
 *
 * @param length - Length of the token in bytes (default: 32)
 * @returns Hex-encoded random token
 *
 * @example
 * const token = generateSecureToken();
 * // "a1b2c3d4..."
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if a timestamp is expired
 *
 * @param expiresAt - Expiration timestamp in milliseconds
 * @returns True if expired
 */
export function isExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Format timestamp for display
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Puerto_Rico',
  });
}

/**
 * Validate admin key
 *
 * @param providedKey - Key provided by the caller
 * @throws Error if key is invalid or missing
 */
export function validateAdminKey(providedKey: string): void {
  const adminKey = process.env.ADMIN_SECRET_KEY;

  if (!adminKey) {
    throw new Error("Admin functionality not configured - ADMIN_SECRET_KEY is missing");
  }

  if (providedKey !== adminKey) {
    throw new Error("Unauthorized access - Invalid admin key");
  }
}

/**
 * Create a standardized success result
 *
 * @param data - Result data
 * @param metadata - Optional metadata
 * @returns Tool result object
 */
export function createSuccessResult<T>(data: T, metadata?: any) {
  return {
    success: true,
    data,
    ...(metadata && { metadata }),
  };
}

/**
 * Create a standardized error result
 *
 * @param error - Error message or Error object
 * @returns Tool result object
 */
export function createErrorResult(error: string | Error) {
  const message = error instanceof Error ? error.message : error;
  return {
    success: false,
    error: message,
  };
}

/**
 * Validate required fields in an object
 *
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @throws Error if any required field is missing
 */
export function validateRequiredFields<T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): void {
  const missing = requiredFields.filter(field => {
    const value = obj[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}
