import { v } from "convex/values";

// Centralize shared validators for Convex functions.
export const shipmentReference = v.object({ reference: v.string() });

// GeoLocales validators
export const coordinatesValidator = v.object({
  lat: v.float64(),
  lng: v.float64()
});

export const geoLocaleValidator = v.object({
  name: v.string(),
  coordinates: coordinatesValidator,
  type: v.optional(v.string()),
  region: v.optional(v.string()),
  description: v.optional(v.string()),
  isActive: v.optional(v.boolean())
});

export const facilityVariableTypeValidator = v.union(
  v.literal("text"),
  v.literal("email"),
  v.literal("number"),
  v.literal("coordinates"),
  v.literal("nested")
);

export const unitCategoryValidator = v.union(
  v.literal("distance"),
  v.literal("area"),
  v.literal("time"),
  v.literal("capacity"),
  v.literal("volume"),
  v.literal("power"),
  v.literal("percentage")
);

export const facilityVariableValidator = v.object({
  key: v.string(),
  label: v.string(),
  type: facilityVariableTypeValidator,
  value: v.optional(v.union(v.string(), v.float64())),
  unit: v.optional(v.string()),
  unitCategory: v.optional(unitCategoryValidator),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  sortOrder: v.optional(v.float64())
});

export const facilityBoxValidator = v.object({
  title: v.string(),
  icon: v.string(),
  color: v.string(),
  sortOrder: v.optional(v.float64()),
  variables: v.array(facilityVariableValidator)
});

export const bulkGeoLocaleDataValidator = v.object({
  geoLocale: geoLocaleValidator,
  boxes: v.array(facilityBoxValidator)
});

// Search and filter validators
export const searchValidator = v.object({
  searchTerm: v.string(),
  limit: v.optional(v.number())
});

export const coordinateSearchValidator = v.object({
  lat: v.float64(),
  lng: v.float64(),
  radiusKm: v.optional(v.number()),
  limit: v.optional(v.number())
});

export const typeFilterValidator = v.object({
  type: v.string(),
  includeInactive: v.optional(v.boolean())
});

export const regionFilterValidator = v.object({
  region: v.string(),
  includeInactive: v.optional(v.boolean())
});
