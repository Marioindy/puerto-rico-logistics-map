import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Minimal logistics entities; flesh out fields once data contracts are agreed.
export default defineSchema({
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
