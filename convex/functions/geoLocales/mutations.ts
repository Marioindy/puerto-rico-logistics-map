import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const createGeoLocale = mutation({
  args: {
    name: v.string(),
    coordinates: v.object({
      lat: v.float64(),
      lng: v.float64()
    }),
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const geoLocaleId = await ctx.db.insert("geoLocales", {
      name: args.name,
      coordinates: args.coordinates,
      type: args.type,
      region: args.region,
      description: args.description,
      isActive: args.isActive ?? true
    });

    return geoLocaleId;
  }
});

export const updateGeoLocale = mutation({
  args: {
    id: v.id("geoLocales"),
    name: v.optional(v.string()),
    coordinates: v.optional(v.object({
      lat: v.float64(),
      lng: v.float64()
    })),
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  }
});

export const deleteGeoLocale = mutation({
  args: {
    id: v.id("geoLocales"),
    hardDelete: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const { id, hardDelete = false } = args;

    if (hardDelete) {
      const boxes = await ctx.db
        .query("facilityBoxes")
        .withIndex("by_geoLocale", q => q.eq("geoLocaleId", id))
        .collect();

      for (const box of boxes) {
        const variables = await ctx.db
          .query("facilityVariables")
          .withIndex("by_box", q => q.eq("boxId", box._id))
          .collect();

        for (const variable of variables) {
          await ctx.db.delete(variable._id);
        }

        await ctx.db.delete(box._id);
      }

      await ctx.db.delete(id);
    } else {
      await ctx.db.patch(id, { isActive: false });
    }

    return id;
  }
});

export const createFacilityBox = mutation({
  args: {
    geoLocaleId: v.id("geoLocales"),
    title: v.string(),
    icon: v.string(),
    color: v.string(),
    sortOrder: v.optional(v.float64())
  },
  handler: async (ctx, args) => {
    const geoLocale = await ctx.db.get(args.geoLocaleId);
    if (!geoLocale) {
      throw new Error("GeoLocale not found");
    }

    const boxId = await ctx.db.insert("facilityBoxes", {
      geoLocaleId: args.geoLocaleId,
      title: args.title,
      icon: args.icon,
      color: args.color,
      sortOrder: args.sortOrder ?? 0
    });

    return boxId;
  }
});

export const updateFacilityBox = mutation({
  args: {
    id: v.id("facilityBoxes"),
    title: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    sortOrder: v.optional(v.float64())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  }
});

export const deleteFacilityBox = mutation({
  args: {
    id: v.id("facilityBoxes")
  },
  handler: async (ctx, args) => {
    const variables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_box", q => q.eq("boxId", args.id))
      .collect();

    for (const variable of variables) {
      await ctx.db.delete(variable._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  }
});

export const createFacilityVariable = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const box = await ctx.db.get(args.boxId);
    if (!box) {
      throw new Error("Facility box not found");
    }

    if (args.parentVariableId) {
      const parentVariable = await ctx.db.get(args.parentVariableId);
      if (!parentVariable || parentVariable.type !== "nested") {
        throw new Error("Parent variable must be of type 'nested'");
      }
    }

    const variableId = await ctx.db.insert("facilityVariables", {
      boxId: args.boxId,
      key: args.key,
      label: args.label,
      type: args.type,
      value: args.value,
      unit: args.unit,
      unitCategory: args.unitCategory,
      icon: args.icon,
      color: args.color,
      parentVariableId: args.parentVariableId,
      sortOrder: args.sortOrder ?? 0
    });

    return variableId;
  }
});

export const updateFacilityVariable = mutation({
  args: {
    id: v.id("facilityVariables"),
    key: v.optional(v.string()),
    label: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("text"),
      v.literal("email"),
      v.literal("number"),
      v.literal("coordinates"),
      v.literal("nested")
    )),
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
    sortOrder: v.optional(v.float64())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(id, cleanUpdates);
    return id;
  }
});

export const deleteFacilityVariable = mutation({
  args: {
    id: v.id("facilityVariables")
  },
  handler: async (ctx, args) => {
    const subVariables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_parent", q => q.eq("parentVariableId", args.id))
      .collect();

    for (const subVar of subVariables) {
      await ctx.db.delete(subVar._id);
    }

    await ctx.db.delete(args.id);
    return args.id;
  }
});

export const bulkCreateGeoLocaleData = mutation({
  args: {
    geoLocale: v.object({
      name: v.string(),
      coordinates: v.object({
        lat: v.float64(),
        lng: v.float64()
      }),
      type: v.optional(v.string()),
      region: v.optional(v.string()),
      description: v.optional(v.string()),
      isActive: v.optional(v.boolean())
    }),
    boxes: v.array(v.object({
      title: v.string(),
      icon: v.string(),
      color: v.string(),
      sortOrder: v.optional(v.float64()),
      variables: v.array(v.object({
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
        sortOrder: v.optional(v.float64()),
        subVariables: v.optional(v.array(v.object({
          key: v.string(),
          label: v.string(),
          type: v.union(
            v.literal("text"),
            v.literal("email"),
            v.literal("number"),
            v.literal("coordinates")
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
          sortOrder: v.optional(v.float64())
        })))
      }))
    }))
  },
  handler: async (ctx, args) => {
    const geoLocaleId = await ctx.db.insert("geoLocales", {
      ...args.geoLocale,
      isActive: args.geoLocale.isActive ?? true
    });

    for (const boxData of args.boxes) {
      const boxId = await ctx.db.insert("facilityBoxes", {
        geoLocaleId,
        title: boxData.title,
        icon: boxData.icon,
        color: boxData.color,
        sortOrder: boxData.sortOrder ?? 0
      });

      for (const variableData of boxData.variables) {
        const variableId = await ctx.db.insert("facilityVariables", {
          boxId,
          key: variableData.key,
          label: variableData.label,
          type: variableData.type,
          value: variableData.value,
          unit: variableData.unit,
          unitCategory: variableData.unitCategory,
          icon: variableData.icon,
          color: variableData.color,
          sortOrder: variableData.sortOrder ?? 0
        });

        if (variableData.subVariables) {
          for (const subVarData of variableData.subVariables) {
            await ctx.db.insert("facilityVariables", {
              boxId,
              key: subVarData.key,
              label: subVarData.label,
              type: subVarData.type,
              value: subVarData.value,
              unit: subVarData.unit,
              unitCategory: subVarData.unitCategory,
              icon: subVarData.icon,
              color: subVarData.color,
              parentVariableId: variableId,
              sortOrder: subVarData.sortOrder ?? 0
            });
          }
        }
      }
    }

    return geoLocaleId;
  }
});