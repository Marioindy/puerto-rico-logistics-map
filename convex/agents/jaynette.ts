/**
 * Jaynette - Administrative Database Management Agent
 *
 * Jaynette is a professional administrative assistant that helps manage
 * facility data through natural language commands. She has full database
 * access with proper authentication and validation.
 *
 * Model: Claude 3.5 Sonnet (advanced reasoning for complex operations)
 * Access: Full database access (create, update, delete)
 * Security: Session-based authentication + ADMIN_SECRET_KEY validation
 *
 * Tools Available:
 * - create_facility: Create new facilities with validation
 * - update_facility: Modify existing facility data
 * - delete_facility: Remove facilities (with cascade)
 * - bulk_import: Import multiple facilities with dry-run mode
 * - generate_report: Create analytics and reports
 */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import type { BulkImportResult } from "@/agents/lib/types";
import {
  validateCoordinates,
  validateAdminKey,
  createSuccessResult,
  createErrorResult,
  countBy,
  FACILITY_TYPES,
  REGIONS,
} from "./shared/helpers";

/**
 * Tool 1: Create Facility
 *
 * Create a new facility with complete validation.
 * Checks for duplicates and validates all data before insertion.
 *
 * @example
 * create_facility({
 *   name: "Central Warehouse",
 *   type: "warehouse",
 *   coordinates: { lat: 18.4, lng: -66.0 },
 *   description: "Main distribution center",
 *   region: "central"
 * })
 */
export const createFacilityTool = createTool({
  description: "Create a new facility in the database. Validates coordinates, checks for duplicates, and ensures data integrity.",
  args: z.object({
    name: z.string().min(3).max(200).describe("Facility name (must be unique)"),
    type: z.enum(FACILITY_TYPES).describe("Facility type: warehouse, port, airport, or facility"),
    coordinates: z.object({
      lat: z.number().min(17.5).max(18.6),
      lng: z.number().min(-67.5).max(-65.0),
    }).describe("GPS coordinates (must be within Puerto Rico)"),
    description: z.string().optional().describe("Detailed description of the facility"),
    region: z.enum(REGIONS).optional().describe("Geographic region: north, south, east, west, or central"),
  }),
  handler: async (ctx, args) => {
    try {
      // Get admin key from environment
      const adminKey = process.env.ADMIN_SECRET_KEY!;
      validateAdminKey(adminKey);

      // Validate coordinates
      validateCoordinates(args.coordinates, "Facility coordinates");

      // Check for duplicate names
      const existing = await ctx.runQuery(api.geoLocales.list, {
        activeOnly: false,
      });

      const duplicate = existing.find(
        f => f.name.toLowerCase() === args.name.toLowerCase()
      );

      if (duplicate) {
        return createErrorResult(
          `A facility named "${args.name}" already exists (ID: ${duplicate._id})`
        );
      }

      // Create facility
      const locationId = await ctx.runMutation(api.geoLocales.adminCreate, {
        adminKey,
        name: args.name,
        type: args.type,
        coordinates: args.coordinates,
        description: args.description || "",
        region: args.region || "central",
        isActive: true,
      });

      return createSuccessResult({
        facilityId: locationId,
        name: args.name,
        type: args.type,
        message: `Facility "${args.name}" created successfully`,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 2: Update Facility
 *
 * Update an existing facility's information.
 * Validates all changes before applying them.
 *
 * @example
 * update_facility({
 *   facilityId: "j123456789",
 *   updates: {
 *     description: "Updated description",
 *     region: "north"
 *   }
 * })
 */
export const updateFacilityTool = createTool({
  description: "Update an existing facility's information. Can update name, type, coordinates, description, region, or active status.",
  args: z.object({
    facilityId: z.string().describe("The unique ID of the facility to update"),
    updates: z.object({
      name: z.string().min(3).max(200).optional(),
      type: z.enum(FACILITY_TYPES).optional(),
      coordinates: z.object({
        lat: z.number().min(17.5).max(18.6),
        lng: z.number().min(-67.5).max(-65.0),
      }).optional(),
      description: z.string().optional(),
      region: z.enum(REGIONS).optional(),
      isActive: z.boolean().optional(),
    }).describe("Fields to update (only include fields that should change)"),
  }),
  handler: async (ctx, args) => {
    try {
      const adminKey = process.env.ADMIN_SECRET_KEY!;
      validateAdminKey(adminKey);

      // Validate coordinates if provided
      if (args.updates.coordinates) {
        validateCoordinates(args.updates.coordinates, "Updated coordinates");
      }

      // Check if facility exists
      const existing = await ctx.runQuery(api.geoLocales.getById, {
        id: args.facilityId,
      });

      if (!existing) {
        return createErrorResult(`Facility with ID ${args.facilityId} not found`);
      }

      // Check for name conflicts if renaming
      if (args.updates.name && args.updates.name !== existing.name) {
        const allFacilities = await ctx.runQuery(api.geoLocales.list, {
          activeOnly: false,
        });

        const conflict = allFacilities.find(
          f => f.name.toLowerCase() === args.updates.name!.toLowerCase() &&
               f._id !== args.facilityId
        );

        if (conflict) {
          return createErrorResult(
            `Another facility named "${args.updates.name}" already exists`
          );
        }
      }

      // Perform update
      await ctx.runMutation(api.geoLocales.adminUpdate, {
        adminKey,
        id: args.facilityId,
        ...args.updates,
      });

      return createSuccessResult({
        facilityId: args.facilityId,
        updatedFields: Object.keys(args.updates),
        message: `Facility "${existing.name}" updated successfully`,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 3: Delete Facility
 *
 * Delete a facility from the database.
 * This is a destructive operation that cascades to boxes and variables.
 *
 * @example
 * delete_facility({ facilityId: "j123456789" })
 */
export const deleteFacilityTool = createTool({
  description: "Delete a facility from the database. WARNING: This is destructive and will also delete all associated boxes and variables. Use with caution.",
  args: z.object({
    facilityId: z.string().describe("The unique ID of the facility to delete"),
  }),
  handler: async (ctx, args) => {
    try {
      const adminKey = process.env.ADMIN_SECRET_KEY!;
      validateAdminKey(adminKey);

      // Get facility info before deletion
      const facility = await ctx.runQuery(api.geoLocales.getById, {
        id: args.facilityId,
      });

      if (!facility) {
        return createErrorResult(`Facility with ID ${args.facilityId} not found`);
      }

      // Delete facility (cascades to boxes and variables)
      await ctx.runMutation(api.geoLocales.adminDelete, {
        adminKey,
        id: args.facilityId,
      });

      return createSuccessResult({
        facilityId: args.facilityId,
        deletedName: facility.name,
        message: `Facility "${facility.name}" and all associated data deleted successfully`,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 4: Bulk Import
 *
 * Import multiple facilities at once with validation.
 * Supports dry-run mode to validate before committing.
 *
 * @example
 * bulk_import({
 *   facilities: [
 *     { name: "Facility 1", type: "warehouse", lat: 18.4, lng: -66.0 },
 *     { name: "Facility 2", type: "port", lat: 18.3, lng: -66.1 }
 *   ],
 *   dryRun: true
 * })
 */
export const bulkImportTool = createTool({
  description: "Import multiple facilities at once. Use dryRun: true to validate without creating. Returns summary of successful, failed, and skipped entries.",
  args: z.object({
    facilities: z.array(z.object({
      name: z.string(),
      type: z.enum(FACILITY_TYPES),
      lat: z.number(),
      lng: z.number(),
      description: z.string().optional(),
      region: z.enum(REGIONS).optional(),
    })).describe("Array of facilities to import"),
    dryRun: z.boolean().optional().default(false).describe("If true, validate without creating (default: false)"),
  }),
  handler: async (ctx, args) => {
    try {
      const adminKey = process.env.ADMIN_SECRET_KEY!;
      validateAdminKey(adminKey);

      // Get existing facilities for duplicate checking
      const existing = await ctx.runQuery(api.geoLocales.list, {
        activeOnly: false,
      });
      const existingNames = new Set(existing.map(f => f.name.toLowerCase()));

      const results: BulkImportResult = {
        successful: [],
        failed: [],
        skipped: [],
      };

      for (let i = 0; i < args.facilities.length; i++) {
        const facility = args.facilities[i];
        const rowNumber = i + 1;

        try {
          // Validate coordinates
          if (facility.lat < 17.5 || facility.lat > 18.6) {
            throw new Error(`Latitude ${facility.lat} outside Puerto Rico bounds (17.5-18.6)`);
          }
          if (facility.lng < -67.5 || facility.lng > -65.0) {
            throw new Error(`Longitude ${facility.lng} outside Puerto Rico bounds (-67.5 to -65.0)`);
          }

          // Check for duplicates
          if (existingNames.has(facility.name.toLowerCase())) {
            results.skipped.push({
              row: rowNumber,
              name: facility.name,
              reason: "Facility with this name already exists",
            });
            continue;
          }

          // Create facility if not dry run
          if (!args.dryRun) {
            const id = await ctx.runMutation(api.geoLocales.adminCreate, {
              adminKey,
              name: facility.name,
              type: facility.type,
              coordinates: { lat: facility.lat, lng: facility.lng },
              description: facility.description || "",
              region: facility.region || "central",
              isActive: true,
            });

            results.successful.push({
              row: rowNumber,
              name: facility.name,
              id,
            });

            // Add to existing names set to catch duplicates within batch
            existingNames.add(facility.name.toLowerCase());
          } else {
            results.successful.push({
              row: rowNumber,
              name: facility.name,
              status: "would be created",
            });
          }
        } catch (error) {
          results.failed.push({
            row: rowNumber,
            name: facility.name,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return createSuccessResult({
        dryRun: args.dryRun,
        summary: {
          total: args.facilities.length,
          successful: results.successful.length,
          failed: results.failed.length,
          skipped: results.skipped.length,
        },
        results,
        message: args.dryRun
          ? "Dry run completed - no changes made"
          : `Import completed: ${results.successful.length} created, ${results.failed.length} failed, ${results.skipped.length} skipped`,
      });
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Tool 5: Generate Report
 *
 * Create various types of reports about facilities.
 * Supports summary, detailed, and filtered reports.
 *
 * @example
 * generate_report({
 *   reportType: "summary",
 *   filters: { region: "north", activeOnly: true }
 * })
 */
export const generateReportTool = createTool({
  description: "Generate reports about facilities. Types: 'summary' (counts and statistics), 'detailed' (full facility data), 'capacity' (storage/handling capacity).",
  args: z.object({
    reportType: z.enum(["summary", "detailed", "capacity"]).describe("Type of report to generate"),
    filters: z.object({
      type: z.enum(FACILITY_TYPES).optional(),
      region: z.enum(REGIONS).optional(),
      activeOnly: z.boolean().optional(),
    }).optional().describe("Optional filters to apply"),
  }),
  handler: async (ctx, args) => {
    try {
      const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
        type: args.filters?.type,
        region: args.filters?.region,
        activeOnly: args.filters?.activeOnly,
      });

      switch (args.reportType) {
        case "summary":
          return createSuccessResult({
            reportType: "summary",
            generated: new Date().toISOString(),
            summary: {
              total: facilities.length,
              active: facilities.filter(f => f.isActive).length,
              inactive: facilities.filter(f => !f.isActive).length,
              byType: countBy(facilities, 'type'),
              byRegion: countBy(facilities, 'region'),
            },
            filters: args.filters || "none",
          });

        case "detailed":
          return createSuccessResult({
            reportType: "detailed",
            generated: new Date().toISOString(),
            facilities: facilities.map(f => ({
              id: f._id,
              name: f.name,
              type: f.type,
              region: f.region,
              coordinates: f.coordinates,
              description: f.description,
              isActive: f.isActive,
              boxCount: f.boxes?.length || 0,
            })),
            total: facilities.length,
          });

        case "capacity":
          // This would analyze capacity-related variables
          return createSuccessResult({
            reportType: "capacity",
            generated: new Date().toISOString(),
            message: "Capacity analysis - feature to be enhanced with variable parsing",
            facilitiesAnalyzed: facilities.length,
          });

        default:
          return createErrorResult("Unknown report type");
      }
    } catch (error) {
      return createErrorResult(error as Error);
    }
  },
});

/**
 * Create Thread
 *
 * Initialize a new admin conversation thread.
 * Requires valid session token.
 */
export const createThread = action({
  args: {
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.runQuery(api.adminSessions.validate, {
      token: args.sessionToken,
    });

    if (!session.valid) {
      throw new Error("Invalid or expired admin session");
    }

    // Generate a unique thread ID
    const threadId = `jaynette_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize thread in Convex AI Component
    await ctx.runMutation(api.agent.threads.create, {
      threadId,
      metadata: {
        agentType: "jaynette",
        userId: session.session!.userId,
        sessionToken: args.sessionToken,
        createdAt: Date.now(),
      },
    });

    return {
      threadId,
      message: "Admin thread created successfully",
    };
  },
});

/**
 * Admin Chat Action
 *
 * Process admin commands with session validation.
 * This integrates all admin tools with Jaynette agent.
 */
export const adminChat = action({
  args: {
    sessionToken: v.string(),
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.runQuery(api.adminSessions.validate, {
      token: args.sessionToken,
    });

    if (!session.valid) {
      throw new Error("Invalid or expired admin session");
    }

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
    // Full implementation will use Agent.generateText() with jaynetteTools

    const response = "I'm Jaynette, your administrative assistant. I'm currently being set up to help you with database management operations. Full AI integration with admin tools coming soon!";

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
 * Retrieve all messages in an admin conversation thread.
 * Requires valid session token.
 */
export const getThreadMessages = action({
  args: {
    threadId: v.string(),
    sessionToken: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.runQuery(api.adminSessions.validate, {
      token: args.sessionToken,
    });

    if (!session.valid) {
      throw new Error("Invalid or expired admin session");
    }

    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    return messages || [];
  },
});

/**
 * Export all Jaynette tools as a collection
 */
export const jaynetteTools = {
  create_facility: createFacilityTool,
  update_facility: updateFacilityTool,
  delete_facility: deleteFacilityTool,
  bulk_import: bulkImportTool,
  generate_report: generateReportTool,
};
