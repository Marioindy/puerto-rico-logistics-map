// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  facilityBoxes: defineTable({
    geoLocaleId: v.id("geoLocales"),
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    sortOrder: v.number(),
  })
    .index("by_geoLocaleId", ["geoLocaleId"]),

  facilityVariables: defineTable({
    boxId: v.id("facilityBoxes"),
    key: v.string(),
    label: v.string(),
    type: v.string(),
    value: v.optional(v.union(v.string(), v.number())),
    sortOrder: v.number(),
    parentVariableId: v.optional(v.id("facilityVariables")),
    unit: v.optional(v.string()),
    unitCategory: v.optional(v.string()),
  })
    .index("by_boxId", ["boxId"])
    .index("by_key", ["key"]),

  geoLocales: defineTable({
    name: v.string(),
    type: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    description: v.string(),
    region: v.string(),
    isActive: v.boolean(),
  })
    .index("by_name", ["name"])
    .index("by_type", ["type"])
    .index("by_region", ["region"])
    .index("by_isActive", ["isActive"]),

  shipments: defineTable({
    reference: v.string(),
    createdByEmail: v.string(),
    originGeoId: v.id("geoLocales"),
    destinationGeoId: v.id("geoLocales"),
    mode: v.string(),
    status: v.string(),
    etd: v.number(),
    eta: v.number(),
    atd: v.optional(v.number()),
    ata: v.optional(v.number()),
    trackingNumber: v.optional(v.string()),
    bl: v.optional(v.string()),
    awb: v.optional(v.string()),
    weightKg: v.optional(v.number()),
    volumeM3: v.optional(v.number()),
    pieces: v.optional(v.number()),
    hazmat: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index("by_reference", ["reference"])
    .index("by_status", ["status"])
    .index("by_originGeoId", ["originGeoId"])
    .index("by_destinationGeoId", ["destinationGeoId"]),
});
