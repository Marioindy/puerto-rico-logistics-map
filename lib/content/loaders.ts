/**
 * lib/content/loaders.ts
 *
 * Loads and validates content with Zod.
 * - Build/dev: throws with readable errors if content is malformed.
 * - Future: replace the imports with CMS fetches, then validate the remote JSON with the same schemas.
 */
import type { HomeContent } from "@/types/content"; // legacy app-wide type
import { homeContent } from "@/content/home"; // current local content-as-code source
import {
  HomeContentSchema,
  type HomeContentZ,
  FacilitiesDatabaseSchema,
  MapMarkersSchema,
  FacilitySummarySchema,
  type FacilitiesDatabaseZ,
  type MapMarkersZ,
  type FacilitySummaryZ
} from "@/lib/content/schema"; // Zod schemas + inferred types

// Import facility data
import {
  facilityDatabase,
  mapMarkers,
  facilitySummary
} from "@/lib/facilityData";

/**
 * Validate and return the Home content.
 *
 * Notes for maintainers and AIs:
 * - Prefer `safeParse` if you want to handle errors without throwing.
 * - We use `.parse()` here to fail fast during build/CI when content is invalid.
 * - If you introduce a CMS, map the raw payload to this shape first, then validate.
 */
export async function getHomeContent(): Promise<HomeContent> {
  const parsed: HomeContentZ = HomeContentSchema.parse(homeContent);
  // Return as the legacy HomeContent type; shapes are aligned.
  return parsed as HomeContent;
}

/**
 * Validate and return the facilities database.
 *
 * Notes for maintainers and AIs:
 * - Validates all facility data against the Zod schema.
 * - Throws with readable errors if facility data is malformed.
 * - Future: replace with CMS/API fetch, then validate the remote data.
 */
export async function getFacilitiesDatabase(): Promise<FacilitiesDatabaseZ> {
  return FacilitiesDatabaseSchema.parse(facilityDatabase);
}

/**
 * Validate and return all map markers.
 *
 * Notes for maintainers and AIs:
 * - Validates marker data including coordinates and facility references.
 * - Ensures all marker types are valid enum values.
 * - Future: replace with dynamic data source, then validate.
 */
export async function getMapMarkers(): Promise<MapMarkersZ> {
  return MapMarkersSchema.parse(mapMarkers);
}

/**
 * Validate and return facility summary statistics.
 *
 * Notes for maintainers and AIs:
 * - Validates summary stats are non-negative integers.
 * - Useful for dashboard displays and analytics.
 * - Future: calculate dynamically from validated facility data.
 */
export async function getFacilitySummary(): Promise<FacilitySummaryZ> {
  return FacilitySummarySchema.parse(facilitySummary);
}

/**
 * Get a single facility by ID with validation.
 *
 * Notes for maintainers and AIs:
 * - Returns undefined if facility doesn't exist.
 * - Validates the facility data if found.
 * - Use this for individual facility lookups.
 */
export async function getFacilityById(id: string): Promise<FacilitiesDatabaseZ[string] | undefined> {
  const facilities = await getFacilitiesDatabase();
  return facilities[id];
}

/**
 * Get markers filtered by type with validation.
 *
 * Notes for maintainers and AIs:
 * - Validates both the filter parameter and returned data.
 * - Ensures type safety for map filtering operations.
 */
export async function getMarkersByType(type: 'airport' | 'port' | 'warehouse' | 'facility'): Promise<MapMarkersZ> {
  const markers = await getMapMarkers();
  return markers.filter(marker => marker.type === type);
}
