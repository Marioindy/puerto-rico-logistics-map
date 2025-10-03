// convex/facilityBoxes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";

/**
 * Helper: Validate admin access
 */
function validateAdminKey(adminKey: string) {
  const secretKey = process.env.ADMIN_SECRET_KEY;

  if (!secretKey) {
    throw new ConvexError("Admin functionality not configured");
  }

  if (adminKey !== secretKey) {
    throw new ConvexError("Unauthorized access");
  }
}

/**
 * Query: Get all boxes for a specific geoLocale
 */
export const getByGeoLocaleId = query({
  args: { geoLocaleId: v.id("geoLocales") },
  handler: async (ctx, args) => {
    const boxes = await ctx.db
      .query("facilityBoxes")
      .withIndex("by_geoLocaleId", (q) => q.eq("geoLocaleId", args.geoLocaleId))
      .collect();

    return boxes.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Query: Get a single box by ID
 */
export const getById = query({
  args: { id: v.id("facilityBoxes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Admin Mutation: Create a new facilityBox
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminCreate = mutation({
  args: {
    adminKey: v.string(),
    geoLocaleId: v.id("geoLocales"),
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, ...data } = args;

    // Validate geoLocale exists
    const geoLocale = await ctx.db.get(args.geoLocaleId);
    if (!geoLocale) {
      throw new ConvexError("GeoLocale not found");
    }

    return await ctx.db.insert("facilityBoxes", data);
  },
});

/**
 * Admin Mutation: Update an existing facilityBox
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminUpdate = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("facilityBoxes"),
    geoLocaleId: v.optional(v.id("geoLocales")),
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, id, ...updates } = args;

    // Validate geoLocale exists if being updated
    if (updates.geoLocaleId) {
      const geoLocale = await ctx.db.get(updates.geoLocaleId);
      if (!geoLocale) {
        throw new ConvexError("GeoLocale not found");
      }
    }

    // Remove undefined fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

/**
 * Admin Mutation: Delete a facilityBox
 * Requires ADMIN_SECRET_KEY environment variable
 * WARNING: This will cascade delete all associated facilityVariables
 */
export const adminDelete = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("facilityBoxes"),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    // Delete all variables for this box
    const variables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_boxId", (q) => q.eq("boxId", args.id))
      .collect();

    for (const variable of variables) {
      await ctx.db.delete(variable._id);
    }

    // Delete the box
    await ctx.db.delete(args.id);
    return args.id;
  },
});
