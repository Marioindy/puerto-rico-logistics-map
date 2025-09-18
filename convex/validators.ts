import { v } from "convex/values";

// Centralize shared validators for Convex functions.
export const shipmentReference = v.object({ reference: v.string() });
