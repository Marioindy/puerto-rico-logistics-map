import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core GeoLocales table - each record represents a geographic location
  geoLocales: defineTable({
    name: v.string(),
    coordinates: v.object({
      lat: v.float64(),
      lng: v.float64()
    }),
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_region", ["region"])
    .index("by_coordinates", ["coordinates.lat", "coordinates.lng"]),

  // Information boxes for each GeoLocale - organizes related data
  facilityBoxes: defineTable({
    geoLocaleId: v.id("geoLocales"),
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    sortOrder: v.optional(v.float64())
  })
    .index("by_geoLocale", ["geoLocaleId"])
    .index("by_geoLocale_order", ["geoLocaleId", "sortOrder"]),

  // Individual data variables within each box
  facilityVariables: defineTable({
    boxId: v.id("facilityBoxes"),
    key: v.string(),
    label: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("email"),
      v.literal("number"),
      v.literal("coordinates"),
      v.literal("nested")
    ),
    value: v.optional(v.union(v.string(), v.float64())),
    unit: v.optional(v.string()),
    unitCategory: v.optional(v.union(
      v.literal("distance"),
      v.literal("area"),
      v.literal("time"),
      v.literal("capacity"),
      v.literal("volume"),
      v.literal("power"),
      v.literal("percentage")
    )),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    parentVariableId: v.optional(v.id("facilityVariables")),
    sortOrder: v.optional(v.float64())
  })
    .index("by_box", ["boxId"])
    .index("by_box_order", ["boxId", "sortOrder"])
    .index("by_parent", ["parentVariableId"])
    .index("by_key", ["key"]),

  // Legacy tables (keeping for backward compatibility)
  facilities: defineTable({
    name: v.string(),
    region: v.optional(v.string())
  }).index("by_name", ["name"]),

  shipments: defineTable({
    reference: v.string(),
    status: v.string(),
    updatedAt: v.string()
  }).index("by_reference", ["reference"])
});
