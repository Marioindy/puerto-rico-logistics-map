import { query } from "convex/server";

// Placeholder query until Convex schema + ingestion are finalized.
export const listActiveShipments = query({
  args: {},
  handler: async (ctx) => {
    void ctx;
    return [];
  }
});
