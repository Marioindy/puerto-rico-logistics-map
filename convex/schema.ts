// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  facilities: defineTable({
    // required
    name: v.string(),
    lat: v.number(),
    lng: v.number(),

    // optional fields
    category: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),

    // used for upserts
    externalId: v.optional(v.string()),

    // metadata
    updatedAt: v.number(),
  })
    .index("by_externalId", ["externalId"])
    .index("by_category", ["category"]),
});
