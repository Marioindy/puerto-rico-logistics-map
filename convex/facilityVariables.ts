// convex/facilityVariables.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

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
 * Query: Get all variables for a specific box
 */
export const getByBoxId = query({
  args: { boxId: v.id("facilityBoxes") },
  handler: async (ctx, args) => {
    const variables = await ctx.db
      .query("facilityVariables")
      .withIndex("by_boxId", (q) => q.eq("boxId", args.boxId))
      .collect();

    return variables.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Query: Get a single variable by ID
 */
export const getById = query({
  args: { id: v.id("facilityVariables") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Query: Get variables by key
 */
export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("facilityVariables")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
  },
});

/**
 * Admin Mutation: Create a new facilityVariable
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminCreate = mutation({
  args: {
    adminKey: v.string(),
    boxId: v.id("facilityBoxes"),
    key: v.string(),
    label: v.string(),
    type: v.string(),
    value: v.optional(v.union(v.string(), v.number())),
    sortOrder: v.number(),
    parentVariableId: v.optional(v.id("facilityVariables")),
    unit: v.optional(v.string()),
    unitCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, ...data } = args;

    // Validate box exists
    const box = await ctx.db.get(args.boxId);
    if (!box) {
      throw new ConvexError("FacilityBox not found");
    }

    // Validate parent variable exists if provided
    if (args.parentVariableId) {
      const parent = await ctx.db.get(args.parentVariableId);
      if (!parent) {
        throw new ConvexError("Parent variable not found");
      }
      // Ensure parent belongs to the same box
      if (parent.boxId !== args.boxId) {
        throw new ConvexError("Parent variable must belong to the same box");
      }
    }

    // Validate type
    const validTypes = ["text", "email", "number", "coordinates", "nested"];
    if (!validTypes.includes(args.type)) {
      throw new ConvexError(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
    }

    // Nested type should not have a value
    if (args.type === "nested" && args.value !== undefined) {
      throw new ConvexError("Nested variables cannot have a value");
    }

    return await ctx.db.insert("facilityVariables", data);
  },
});

/**
 * Admin Mutation: Update an existing facilityVariable
 * Requires ADMIN_SECRET_KEY environment variable
 */
export const adminUpdate = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("facilityVariables"),
    boxId: v.optional(v.id("facilityBoxes")),
    key: v.optional(v.string()),
    label: v.optional(v.string()),
    type: v.optional(v.string()),
    value: v.optional(v.union(v.string(), v.number())),
    sortOrder: v.optional(v.number()),
    parentVariableId: v.optional(v.id("facilityVariables")),
    unit: v.optional(v.string()),
    unitCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    const { adminKey, id, ...updates } = args;

    // Get current variable
    const currentVariable = await ctx.db.get(id);
    if (!currentVariable) {
      throw new ConvexError("Variable not found");
    }

    // Validate box exists if being updated
    if (updates.boxId) {
      const box = await ctx.db.get(updates.boxId);
      if (!box) {
        throw new ConvexError("FacilityBox not found");
      }
    }

    // Validate parent variable exists if being updated
    if (updates.parentVariableId) {
      const parent = await ctx.db.get(updates.parentVariableId);
      if (!parent) {
        throw new ConvexError("Parent variable not found");
      }
      // Ensure parent belongs to the same box
      const targetBoxId = updates.boxId ?? currentVariable.boxId;
      if (parent.boxId !== targetBoxId) {
        throw new ConvexError("Parent variable must belong to the same box");
      }
      // Prevent self-referencing
      if (parent._id === id) {
        throw new ConvexError("Variable cannot be its own parent");
      }
    }

    // Validate type if being updated
    if (updates.type) {
      const validTypes = ["text", "email", "number", "coordinates", "nested"];
      if (!validTypes.includes(updates.type)) {
        throw new ConvexError(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
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
 * Admin Mutation: Delete a facilityVariable
 * Requires ADMIN_SECRET_KEY environment variable
 * WARNING: This will cascade delete all child variables
 */
export const adminDelete = mutation({
  args: {
    adminKey: v.string(),
    id: v.id("facilityVariables"),
  },
  handler: async (ctx, args) => {
    validateAdminKey(args.adminKey);

    // Get all child variables
    const allVariables = await ctx.db
      .query("facilityVariables")
      .collect();

    const childVariables = allVariables.filter(
      (v) => v.parentVariableId === args.id
    );

    // Recursively delete children
    for (const child of childVariables) {
      // Recursive delete by calling this mutation again
      await ctx.db.delete(child._id);
    }

    // Delete the variable
    await ctx.db.delete(args.id);
    return args.id;
  },
});
