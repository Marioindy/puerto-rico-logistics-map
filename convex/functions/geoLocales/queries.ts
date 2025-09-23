import { query } from "../../_generated/server";
import { v } from "convex/values";

export const getAllGeoLocales = query({
  args: {
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { includeInactive = false } = args;

    let geoLocales;
    if (includeInactive) {
      geoLocales = await ctx.db.query("geoLocales").collect();
    } else {
      geoLocales = await ctx.db
        .query("geoLocales")
        .filter(q => q.neq(q.field("isActive"), false))
        .collect();
    }

    return geoLocales;
  }
});

export const getGeoLocaleById = query({
  args: {
    id: v.id("geoLocales")
  },
  handler: async (ctx, args) => {
    const geoLocale = await ctx.db.get(args.id);
    return geoLocale;
  }
});

export const getGeoLocalesByType = query({
  args: {
    type: v.string(),
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { type, includeInactive = false } = args;

    let query = ctx.db.query("geoLocales").withIndex("by_type", q => q.eq("type", type));

    if (!includeInactive) {
      query = query.filter(q => q.neq(q.field("isActive"), false));
    }

    return await query.collect();
  }
});

export const getGeoLocalesByRegion = query({
  args: {
    region: v.string(),
    includeInactive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { region, includeInactive = false } = args;

    let query = ctx.db.query("geoLocales").withIndex("by_region", q => q.eq("region", region));

    if (!includeInactive) {
      query = query.filter(q => q.neq(q.field("isActive"), false));
    }

    return await query.collect();
  }
});

export const getFacilityBoxesByGeoLocale = query({
  args: {
    geoLocaleId: v.id("geoLocales")
  },
  handler: async (ctx, args) => {
    const boxes = await ctx.db
      .query("facilityBoxes")
      .withIndex("by_geoLocale_order", q => q.eq("geoLocaleId", args.geoLocaleId))
      .collect();

    return boxes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
});

export const getFacilityVariablesByBox = query({
  args: {
    boxId: v.id("facilityBoxes")
  },
  handler: async (ctx, args) => {
    const variables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_box_order", q => q.eq("boxId", args.boxId))
      .collect();

    return variables.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
});

export const getSubVariables = query({
  args: {
    parentVariableId: v.id("facilityVariables")
  },
  handler: async (ctx, args) => {
    const subVariables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_parent", q => q.eq("parentVariableId", args.parentVariableId))
      .collect();

    return subVariables.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }
});

export const getCompleteGeoLocaleData = query({
  args: {
    geoLocaleId: v.id("geoLocales")
  },
  handler: async (ctx, args) => {
    const geoLocale = await ctx.db.get(args.geoLocaleId);
    if (!geoLocale) {
      return null;
    }

    const boxes = await ctx.db
      .query("facilityBoxes")
      .withIndex("by_geoLocale_order", q => q.eq("geoLocaleId", args.geoLocaleId))
      .collect();

    const boxesWithVariables = await Promise.all(
      boxes.map(async (box) => {
        const variables = await ctx.db
          .query("facilityVariables")
          .withIndex("by_box_order", q => q.eq("boxId", box._id))
          .collect();

        const variablesWithSub = await Promise.all(
          variables.map(async (variable) => {
            if (variable.type === "nested") {
              const subVariables = await ctx.db
                .query("facilityVariables")
                .withIndex("by_parent", q => q.eq("parentVariableId", variable._id))
                .collect();

              return {
                ...variable,
                subVariables: subVariables.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              };
            }
            return variable;
          })
        );

        return {
          ...box,
          variables: variablesWithSub.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        };
      })
    );

    return {
      ...geoLocale,
      boxes: boxesWithVariables.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    };
  }
});

export const searchGeoLocalesByName = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { searchTerm, limit = 50 } = args;

    const geoLocales = await ctx.db
      .query("geoLocales")
      .filter(q => q.neq(q.field("isActive"), false))
      .collect();

    const filtered = geoLocales.filter(gl =>
      gl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (gl.description && gl.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return filtered.slice(0, limit);
  }
});

export const getGeoLocalesNearCoordinates = query({
  args: {
    lat: v.float64(),
    lng: v.float64(),
    radiusKm: v.optional(v.number()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { lat, lng, radiusKm = 50, limit = 20 } = args;

    const geoLocales = await ctx.db
      .query("geoLocales")
      .filter(q => q.neq(q.field("isActive"), false))
      .collect();

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    const nearbyLocales = geoLocales
      .map(gl => ({
        ...gl,
        distance: calculateDistance(lat, lng, gl.coordinates.lat, gl.coordinates.lng)
      }))
      .filter(gl => gl.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyLocales;
  }
});