// convex/facilities.ts (only the list query shown here)
import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";

export const list = queryGeneric({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Build the base query according to whether a category filter is present
    const docs = args.category
      ? await ctx
          .db
          .query("facilities")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .collect()
      : await ctx.db.query("facilities").collect();

    // Optional client-style search on name/address
    const needle = args.search?.toLowerCase();
    const filtered = needle
      ? docs.filter(
          (d) =>
            d.name.toLowerCase().includes(needle) ||
            (d.address?.toLowerCase().includes(needle) ?? false)
        )
      : docs;

    // Stable sort
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  },
});


/**
 * Query: get a single facility by document id
 */
export const getById = queryGeneric({
  args: { id: v.id("facilities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Mutation: upsertMany facilities
 * - Uses `externalId` (if provided) to avoid duplicates
 * - Patches existing docs; inserts new ones
 */
export const upsertMany = mutationGeneric({
  args: {
    facilities: v.array(
      v.object({
        // required
        name: v.string(),
        lat: v.number(),
        lng: v.number(),

        // optional
        category: v.optional(v.string()),
        address: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        description: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),

        externalId: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    for (const f of args.facilities) {
      if (f.externalId) {
        const existing = await ctx.db
          .query("facilities")
          .withIndex("by_externalId", (q) => q.eq("externalId", f.externalId!))
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, { ...f, updatedAt: now });
          continue;
        }
      }

      await ctx.db.insert("facilities", { ...f, updatedAt: now });
    }

    return { ok: true, upserted: args.facilities.length };
  },
});

/**
 * Mutation: delete all facilities (dev/admin helper)
 */
export const deleteAll = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("facilities").collect();
    for (const doc of all) {
      await ctx.db.delete(doc._id);
    }
    return { count: all.length };
  },
});
