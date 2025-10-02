// convex/geoLocales.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

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
            const variablesMap = new Map(sortedVariables.map((v) => [v._id, { ...v, subVariables: [] as any[] }]));
            const rootVariables: any[] = [];

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
        const variablesMap = new Map(sortedVariables.map((v) => [v._id, { ...v, subVariables: [] as any[] }]));
        const rootVariables: any[] = [];

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
