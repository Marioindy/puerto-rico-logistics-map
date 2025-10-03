/**
 * Fabiola - Public Logistics Assistant Agent
 *
 * Fabiola is a friendly, bilingual AI assistant that helps users explore
 * Puerto Rico's logistics infrastructure. She provides read-only access
 * to facility data through natural language queries.
 *
 * Model: Claude 3 Haiku (fast and cost-effective)
 * Access: Read-only (no database modifications)
 * Language: Bilingual (English/Spanish)
 *
 * Tools Available:
 * - search_facilities: Find facilities by name, type, or region
 * - get_facility_details: Get complete information about a facility
 * - get_nearby_facilities: Find facilities near coordinates
 * - get_statistics: Get analytics about the logistics network
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import {
  calculateDistance,
  validateCoordinates,
  sanitizeSearchInput,
  countBy,
  createSuccessResult,
  createErrorResult,
  FACILITY_TYPES,
  REGIONS,
} from "./shared/helpers";

/**
 * Tool 1: Search Facilities
 *
 * Search for logistics facilities using various filters.
 * Supports text search, type filtering, and region filtering.
 *
 * @example
 * // Search by name
 * search_facilities({ search: "UPS" })
 *
 * // Filter by type
 * search_facilities({ type: "warehouse" })
 *
 * // Combine filters
 * search_facilities({ type: "port", region: "north" })
 */
export const searchFacilitiesTool = createTool({
  description: "Search for logistics facilities by name, type, or region. Returns a list of matching facilities with basic information.",
  args: z.object({
    search: z.string().optional().describe("Search term to match against facility names and descriptions"),
    type: z.enum(FACILITY_TYPES).optional().describe("Facility type: warehouse, port, airport, or facility"),
    region: z.enum(REGIONS).optional().describe("Geographic region: north, south, east, west, or central"),
    activeOnly: z.boolean().optional().default(true).describe("Only show active facilities (default: true)"),
  }),
  handler: async (ctx, args) => {
    try {
      // Sanitize search input
      const searchTerm = args.search ? sanitizeSearchInput(args.search) : undefined;

      // Query facilities with filters
      const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
        type: args.type,
        region: args.region,
        activeOnly: args.activeOnly,
      });

      // Apply text search filter if provided
      let results = facilities;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = facilities.filter(f =>
          f.name.toLowerCase().includes(searchLower) ||
          f.description?.toLowerCase().includes(searchLower)
        );
      }

      // Limit results to prevent overwhelming responses
      const limitedResults = results.slice(0, 20);

      return createSuccessResult({
        facilities: limitedResults.map(f => ({
          id: f._id,
          name: f.name,
          type: f.type,
          region: f.region,
          coordinates: f.coordinates,
          description: f.description,
        })),
        total: results.length,
        shown: limitedResults.length,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 2: Get Facility Details
 *
 * Retrieve complete information about a specific facility,
 * including all boxes and variables (capacity, services, etc.)
 *
 * @example
 * get_facility_details({ facilityId: "j123456789" })
 */
export const getFacilityDetailsTool = createTool({
  description: "Get detailed information about a specific facility including capacity, services, and all metadata. Use this when user asks for specifics about a facility.",
  args: z.object({
    facilityId: z.string().describe("The unique ID of the facility"),
  }),
  handler: async (ctx, args) => {
    try {
      const facility = await ctx.runQuery(api.geoLocales.getByIdWithDetails, {
        id: args.facilityId,
      });

      if (!facility) {
        return createErrorResult("Facility not found");
      }

      return createSuccessResult({
        id: facility._id,
        name: facility.name,
        type: facility.type,
        region: facility.region,
        coordinates: facility.coordinates,
        description: facility.description,
        isActive: facility.isActive,
        boxes: facility.boxes?.map(box => ({
          title: box.title,
          icon: box.icon,
          color: box.color,
          variables: box.variables?.map(v => ({
            key: v.key,
            label: v.label,
            type: v.type,
            value: v.value,
            unit: v.unit,
          })),
        })),
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 3: Get Nearby Facilities
 *
 * Find facilities within a specified radius of coordinates.
 * Results are sorted by distance (nearest first).
 *
 * @example
 * get_nearby_facilities({
 *   lat: 18.4,
 *   lng: -66.0,
 *   radiusKm: 10
 * })
 */
export const getNearbyFacilitiesTool = createTool({
  description: "Find facilities near specific coordinates. Results are sorted by distance. Use when user asks about facilities near a location.",
  args: z.object({
    lat: z.number().min(17.5).max(18.6).describe("Latitude (must be within Puerto Rico: 17.5 to 18.6)"),
    lng: z.number().min(-67.5).max(-65.0).describe("Longitude (must be within Puerto Rico: -67.5 to -65.0)"),
    radiusKm: z.number().min(0.1).max(100).optional().default(10).describe("Search radius in kilometers (default: 10km)"),
    type: z.enum(FACILITY_TYPES).optional().describe("Optional: filter by facility type"),
  }),
  handler: async (ctx, args) => {
    try {
      // Validate coordinates
      validateCoordinates(
        { lat: args.lat, lng: args.lng },
        "Search coordinates"
      );

      // Get all active facilities
      const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
        type: args.type,
        activeOnly: true,
      });

      // Calculate distances and filter by radius
      const facilitiesWithDistance = facilities
        .map(f => ({
          ...f,
          distance: calculateDistance(
            { lat: args.lat, lng: args.lng },
            f.coordinates
          ),
        }))
        .filter(f => f.distance <= args.radiusKm)
        .sort((a, b) => a.distance - b.distance);

      return createSuccessResult({
        searchCenter: { lat: args.lat, lng: args.lng },
        radiusKm: args.radiusKm,
        facilities: facilitiesWithDistance.slice(0, 15).map(f => ({
          id: f._id,
          name: f.name,
          type: f.type,
          region: f.region,
          coordinates: f.coordinates,
          description: f.description,
          distance: Math.round(f.distance * 10) / 10, // Round to 1 decimal
        })),
        total: facilitiesWithDistance.length,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 4: Get Statistics
 *
 * Retrieve analytics and statistics about the logistics network.
 * Useful for overview questions and understanding the system.
 *
 * @example
 * get_statistics({ type: "warehouse" })
 */
export const getStatisticsTool = createTool({
  description: "Get statistics and analytics about facilities in the system. Use when user asks about totals, counts, or overview information.",
  args: z.object({
    type: z.enum(FACILITY_TYPES).optional().describe("Optional: get statistics for specific facility type"),
    region: z.enum(REGIONS).optional().describe("Optional: get statistics for specific region"),
  }),
  handler: async (ctx, args) => {
    try {
      const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
        type: args.type,
        region: args.region,
        activeOnly: false, // Include all for complete stats
      });

      const active = facilities.filter(f => f.isActive);

      return createSuccessResult({
        total: facilities.length,
        active: active.length,
        inactive: facilities.length - active.length,
        byType: countBy(facilities, 'type'),
        byRegion: countBy(facilities, 'region'),
        filters: {
          type: args.type || 'all',
          region: args.region || 'all',
        },
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Create Thread
 *
 * Initialize a new conversation thread for a user.
 * This is called when the chat widget is first opened.
 */
export const createThread = action({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate a unique thread ID
    const threadId = `fabiola_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize thread in Convex AI Component
    await ctx.runMutation(api.agent.threads.create, {
      threadId,
      metadata: {
        agentType: "fabiola",
        userId: args.userId || "anonymous",
        createdAt: Date.now(),
      },
    });

    return {
      threadId,
      message: "Thread created successfully",
    };
  },
});

/**
 * Chat Action
 *
 * Process a user message and generate a response using Fabiola.
 * This integrates the Convex AI Component with Claude Agent SDK.
 */
export const chat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Add user message to thread
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "user",
      content: args.message,
    });

    // Get thread history
    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    // TODO: Integrate with Claude Agent SDK
    // For now, return a placeholder response
    // Full implementation will use Agent.generateText() with fabiolaTools

    const response = "I'm Fabiola, your logistics assistant. I'm currently being set up to help you with facility searches and logistics information. Full AI integration coming soon!";

    // Save assistant response
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "assistant",
      content: response,
    });

    return {
      message: response,
      toolsUsed: [],
    };
  },
});

/**
 * Get Thread Messages
 *
 * Retrieve all messages in a conversation thread.
 */
export const getThreadMessages = action({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    return messages || [];
  },
});

/**
 * Export all Fabiola tools as a collection
 *
 * This makes it easy to pass all tools to the Agent constructor
 */
export const fabiolaTools = {
  search_facilities: searchFacilitiesTool,
  get_facility_details: getFacilityDetailsTool,
  get_nearby_facilities: getNearbyFacilitiesTool,
  get_statistics: getStatisticsTool,
};
