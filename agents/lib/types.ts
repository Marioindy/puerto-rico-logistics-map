/**
 * Shared TypeScript types for AI Agents
 *
 * This file contains type definitions used across both Fabiola and Jaynette agents.
 * Keeping types centralized ensures consistency and makes refactoring easier.
 */

import { Id } from "@/convex/_generated/dataModel";

/**
 * Puerto Rico geographic bounds
 * Used for coordinate validation across all tools
 */
export const PUERTO_RICO_BOUNDS = {
  lat: { min: 17.5, max: 18.6 },
  lng: { min: -67.5, max: -65.0 },
} as const;

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
 * Coordinate pair
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Facility search filters
 */
export interface FacilitySearchFilters {
  search?: string;
  type?: FacilityType;
  region?: Region;
  activeOnly?: boolean;
}

/**
 * Facility with distance (for proximity searches)
 */
export interface FacilityWithDistance {
  _id: Id<"geoLocales">;
  name: string;
  type: string;
  coordinates: Coordinates;
  description: string;
  region: string;
  isActive: boolean;
  distance: number; // in kilometers
}

/**
 * Tool execution result
 * Standardized response format for all tools
 */
export type ToolMetadata = Record<string, unknown> & {
  executionTime?: number;
  toolsUsed?: string[];
};

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: ToolMetadata;
}

/**
 * Admin session data
 */
export interface AdminSession {
  _id: Id<"adminSessions">;
  token: string;
  userId: string;
  expiresAt: number;
  createdAt: number;
}

/**
 * Session validation result
 */
export interface SessionValidation {
  valid: boolean;
  session?: AdminSession;
  error?: string;
}

/**
 * Bulk import result
 */
export interface BulkImportResult {
  successful: Array<{
    name: string;
    row?: number;
    id?: Id<"geoLocales">;
    status?: string;
  }>;
  failed: Array<{
    name: string;
    row?: number;
    error: string;
  }>;
  skipped: Array<{
    name: string;
    row?: number;
    reason: string;
    existingId?: Id<"geoLocales">;
  }>;
}

/**
 * Report types
 */
export const REPORT_TYPES = [
  "summary",
  "detailed",
  "capacity",
  "coverage",
] as const;

export type ReportType = typeof REPORT_TYPES[number];

/**
 * Report filter options
 */
export interface ReportFilters {
  type?: string;
  region?: string;
  activeOnly?: boolean;
}

/**
 * Agent configuration options
 */
export interface AgentConfig {
  name: string;
  model: string;
  systemPrompt: string;
  maxSteps: number;
  temperature?: number;
}

/**
 * Tool context (extended from Convex ActionCtx)
 */
export type ConvexCaller = (reference: unknown, args?: Record<string, unknown>) => Promise<unknown>;

export interface ToolContext {
  agent: Record<string, unknown>;
  userId?: string;
  threadId?: string;
  messageId?: string;
  // Convex context methods available
  runQuery: ConvexCaller;
  runMutation: ConvexCaller;
  runAction: ConvexCaller;
}

/**
 * Message metadata for agent conversations
 */
export type MessageMetadata = Record<string, unknown> & {
  toolsUsed?: string[];
  sessionId?: string;
  executionTime?: number;
  cost?: number;
};

export interface ThreadMessage {
  _id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: number;
  metadata?: MessageMetadata;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

/**
 * Helper: Validate coordinates are within Puerto Rico
 */
export function isValidPuertoRicoCoordinates(coords: Coordinates): boolean {
  return (
    coords.lat >= PUERTO_RICO_BOUNDS.lat.min &&
    coords.lat <= PUERTO_RICO_BOUNDS.lat.max &&
    coords.lng >= PUERTO_RICO_BOUNDS.lng.min &&
    coords.lng <= PUERTO_RICO_BOUNDS.lng.max
  );
}

/**
 * Helper: Validate facility type
 */
export function isValidFacilityType(type: string): type is FacilityType {
  return FACILITY_TYPES.includes(type as FacilityType);
}

/**
 * Helper: Validate region
 */
export function isValidRegion(region: string): region is Region {
  return REGIONS.includes(region as Region);
}

/**
 * Helper: Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) *
    Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Helper: Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Helper: Check if session is expired
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Helper: Generate session token
 */
export function generateSessionToken(): string {
  // Generate cryptographically secure random token
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
