// convex/geoLocales.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type FacilityVariableNode = Doc<"facilityVariables"> & {
  subVariables: FacilityVariableNode[];
};

/**
 * Helper: Apply filters to geoLocales
 */
async function getFilteredGeoLocales(
  ctx: QueryCtx,
  args: {
    type?: string;
    region?: string;
    search?: string;
    activeOnly?: boolean;
  }
) {
  const { type, region, search, activeOnly = true } = args;

  // Build base query
  const baseQuery = activeOnly
    ? ctx.db.query("geoLocales").withIndex("by_isActive", (q) => q.eq("isActive", true))
    : ctx.db.query("geoLocales");

  const docs = await baseQuery.collect();

  // Apply filters
  let filtered = docs;

  if (type) {
    filtered = filtered.filter((d) => d.type === type);
  }

  if (region) {
    filtered = filtered.filter((d) => d.region === region);
  }

  if (search) {
    const needle = search.toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.name.toLowerCase().includes(needle) ||
        d.description.toLowerCase().includes(needle)
    );
  }

  // Sort by name
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Query: List all active geoLocales (simple list for map markers)
 * Optional filters: type, region, search
 */
export const list = query({
  args: {
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    search: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await getFilteredGeoLocales(ctx, args);
  },
});

/**
 * Query: Get a single geoLocale by ID
 */
export const getById = query({
  args: { id: v.id("geoLocales") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Query: List geoLocales WITH facilityBoxes WITH facilityVariables
 * Returns complete structure for FacilityInfoPanel display
 */
export const listWithDetails = query({
  args: {
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    search: v.optional(v.string()),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get filtered geoLocales
    const geoLocales = await getFilteredGeoLocales(ctx, args);

    // For each geoLocale, fetch boxes and variables
    const results = await Promise.all(
      geoLocales.map(async (geoLocale: Doc<"geoLocales">) => {
        // Get all boxes for this geoLocale
        const boxes = await ctx.db
          .query("facilityBoxes")
          .withIndex("by_geoLocaleId", (q) => q.eq("geoLocaleId", geoLocale._id))
          .collect();

        // Sort boxes by sortOrder
        const sortedBoxes = boxes.sort((a, b) => a.sortOrder - b.sortOrder);

        // For each box, fetch variables
        const boxesWithVariables = await Promise.all(
          sortedBoxes.map(async (box) => {
            const variables = await ctx.db
              .query("facilityVariables")
              .withIndex("by_boxId", (q) => q.eq("boxId", box._id))
              .collect();

            // Sort variables by sortOrder
            const sortedVariables = variables.sort((a, b) => a.sortOrder - b.sortOrder);

            // Build nested structure (handle parent-child relationships)
            const variablesMap = new Map(sortedVariables.map((variable) => {
              const variableNode: FacilityVariableNode = { ...variable, subVariables: [] };
              return [variable._id, variableNode] as const;
            }));
            const rootVariables: FacilityVariableNode[] = [];

            for (const variable of sortedVariables) {
              const varWithSubs = variablesMap.get(variable._id)!;
              if (variable.parentVariableId) {
                const parent = variablesMap.get(variable.parentVariableId);
                if (parent) {
                  parent.subVariables.push(varWithSubs);
                } else {
                  rootVariables.push(varWithSubs);
                }
              } else {
                rootVariables.push(varWithSubs);
              }
            }

            return {
              id: box._id,
              title: box.title,
              icon: box.icon,
              color: box.color,
              variables: rootVariables,
            };
          })
        );

        return {
          id: geoLocale._id,
          type: geoLocale.type as 'airport' | 'port' | 'warehouse' | 'facility',
          coordinates: geoLocale.coordinates,
          data: {
            title: geoLocale.name,
            type: geoLocale.type,
            boxes: boxesWithVariables,
          },
        };
      })
    );

    return results;
  },
});

/**
 * Query: Get single geoLocale with full details (boxes and variables)
 */
export const getByIdWithDetails = query({
  args: { id: v.id("geoLocales") },
  handler: async (ctx, args) => {
    const geoLocale = await ctx.db.get(args.id);
    if (!geoLocale) return null;

    // Get all boxes for this geoLocale
    const boxes = await ctx.db
      .query("facilityBoxes")
      .withIndex("by_geoLocaleId", (q) => q.eq("geoLocaleId", args.id))
      .collect();

    const sortedBoxes = boxes.sort((a, b) => a.sortOrder - b.sortOrder);

    // For each box, fetch variables
    const boxesWithVariables = await Promise.all(
      sortedBoxes.map(async (box) => {
        const variables = await ctx.db
          .query("facilityVariables")
          .withIndex("by_boxId", (q) => q.eq("boxId", box._id))
          .collect();

        const sortedVariables = variables.sort((a, b) => a.sortOrder - b.sortOrder);

        // Build nested structure
        const variablesMap = new Map(sortedVariables.map((variable) => {
          const variableNode: FacilityVariableNode = { ...variable, subVariables: [] };
          return [variable._id, variableNode] as const;
        }));
        const rootVariables: FacilityVariableNode[] = [];

        for (const variable of sortedVariables) {
          const varWithSubs = variablesMap.get(variable._id)!;
          if (variable.parentVariableId) {
            const parent = variablesMap.get(variable.parentVariableId);
            if (parent) {
              parent.subVariables.push(varWithSubs);
            } else {
              rootVariables.push(varWithSubs);
            }
          } else {
            rootVariables.push(varWithSubs);
          }
        }

        return {
          id: box._id,
          title: box.title,
          icon: box.icon,
          color: box.color,
          variables: rootVariables,
        };
      })
    );

    return {
      id: geoLocale._id,
      type: geoLocale.type as 'airport' | 'port' | 'warehouse' | 'facility',
      coordinates: geoLocale.coordinates,
      data: {
        title: geoLocale.name,
        type: geoLocale.type,
        boxes: boxesWithVariables,
      },
    };
  },
});

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
 * Admin Mutation: Create a new geoLocale
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminCreate = mutation({
  args: {
    adminKey: v.string(),
    name: v.string(),
    type: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    description: v.string(),
    region: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, ...data } = args;

    return await ctx.db.insert("geoLocales", data);
  },
});

/**
 * Admin Mutation: Update an existing geoLocale
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminUpdate = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("geoLocales"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number(),
    })),
    description: v.optional(v.string()),
    region: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, id, ...updates } = args;

    // Remove undefined fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch(id, cleanUpdates);
    return id;
  },
});

/**
 * Admin Mutation: Delete a geoLocale
 * Requires ADMIN_SECRET_KEY environment variable
 * WARNING: This will cascade delete all associated facilityBoxes and facilityVariables
 */
export const adminDelete = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("geoLocales"),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    // Get all boxes for this geoLocale
    const boxes = await ctx.db
      .query("facilityBoxes")
      .withIndex("by_geoLocaleId", (q) => q.eq("geoLocaleId", args.id))
      .collect();

    // Delete all variables for each box
    for (const box of boxes) {
      const variables = await ctx.db
        .query("facilityVariables")
        .withIndex("by_boxId", (q) => q.eq("boxId", box._id))
        .collect();

      for (const variable of variables) {
        await ctx.db.delete(variable._id);
      }

      await ctx.db.delete(box._id);
    }

    // Delete the geoLocale
    await ctx.db.delete(args.id);
    return args.id;
  },
});
