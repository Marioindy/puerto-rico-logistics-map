/**
 * Admin Session Management
 *
 * This module handles authentication and session management for the Jaynette
 * admin interface. It provides password-based authentication with session tokens.
 *
 * Security Features:
 * - Password validation against environment variable
 * - Cryptographically secure session tokens
 * - 4-hour session expiration
 * - Session validation and cleanup
 *
 * Usage:
 * 1. Call `authenticate` with password to create session
 * 2. Use session token for subsequent requests
 * 3. Validate token with `validate` before admin operations
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { generateSecureToken, isExpired } from "./agents/shared/helpers";

/**
 * Session expiration time (4 hours)
 */
const SESSION_EXPIRY_MS = 4 * 60 * 60 * 1000;

/**
 * Authenticate admin user and create session
 *
 * @param password - Admin password (must match ADMIN_INTERFACE_PASSWORD env var)
 * @returns Session token and expiration time
 * @throws Error if password is incorrect or env var not set
 *
 * @example
 * const { token, expiresAt } = await ctx.runMutation(api.adminSessions.authenticate, {
 *   password: "admin-password"
 * });
 */
export const authenticate = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate environment configuration
    const adminPassword = process.env.ADMIN_INTERFACE_PASSWORD;
    if (!adminPassword) {
      throw new Error(
        "Admin authentication not configured. " +
        "Please set ADMIN_INTERFACE_PASSWORD environment variable."
      );
    }

    // Validate password
    if (args.password !== adminPassword) {
      // Add small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error("Invalid password");
    }

    // Generate secure session token
    const token = generateSecureToken(32);
    const now = Date.now();
    const expiresAt = now + SESSION_EXPIRY_MS;

    // Create session in database
    const sessionId = await ctx.db.insert("adminSessions", {
      token,
      userId: "admin", // Currently single admin user
      expiresAt,
      createdAt: now,
    });

    // Clean up expired sessions
    await cleanupExpiredSessions(ctx);

    return {
      sessionId,
      token,
      expiresAt,
      message: "Authentication successful",
    };
  },
});

/**
 * Validate session token
 *
 * Checks if token exists and hasn't expired.
 *
 * @param token - Session token to validate
 * @returns Validation result with session data if valid
 *
 * @example
 * const result = await ctx.runQuery(api.adminSessions.validate, {
 *   token: sessionToken
 * });
 * if (!result.valid) {
 *   throw new Error("Invalid session");
 * }
 */
export const validate = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find session by token
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .first();

    // Session not found
    if (!session) {
      return {
        valid: false,
        error: "Session not found",
      };
    }

    // Check if expired
    if (isExpired(session.expiresAt)) {
      return {
        valid: false,
        error: "Session expired",
      };
    }

    // Valid session
    return {
      valid: true,
      session: {
        _id: session._id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
    };
  },
});

/**
 * Invalidate (logout) a session
 *
 * @param token - Session token to invalidate
 *
 * @example
 * await ctx.runMutation(api.adminSessions.invalidate, {
 *   token: sessionToken
 * });
 */
export const invalidate = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true, message: "Session invalidated" };
  },
});

/**
 * Get all active sessions for a user
 *
 * Useful for admin dashboard to show active sessions
 *
 * @param userId - User ID to get sessions for
 * @returns Array of active sessions
 */
export const getActiveSessions = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("adminSessions")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .collect();

    // Filter out expired sessions
    const activeSessions = sessions.filter(s => !isExpired(s.expiresAt));

    return activeSessions.map(s => ({
      _id: s._id,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      // Don't return token for security
    }));
  },
});

/**
 * Clean up expired sessions
 *
 * This is called automatically during authentication.
 * Can also be run periodically as a cron job.
 */
export const cleanupExpiredSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const allSessions = await ctx.db.query("adminSessions").collect();

    let deletedCount = 0;
    for (const session of allSessions) {
      if (session.expiresAt <= now) {
        await ctx.db.delete(session._id);
        deletedCount++;
      }
    }

    return {
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} expired session(s)`,
    };
  },
});

/**
 * Extend session expiration
 *
 * Useful for "keep me logged in" functionality
 *
 * @param token - Session token to extend
 * @returns New expiration time
 */
export const extendSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", q => q.eq("token", args.token))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (isExpired(session.expiresAt)) {
      throw new Error("Session already expired - please login again");
    }

    const newExpiresAt = Date.now() + SESSION_EXPIRY_MS;

    await ctx.db.patch(session._id, {
      expiresAt: newExpiresAt,
    });

    return {
      success: true,
      expiresAt: newExpiresAt,
      message: "Session extended",
    };
  },
});

/**
 * Get session statistics
 *
 * Useful for monitoring and admin dashboard
 */
export const getSessionStats = query({
  args: {},
  handler: async (ctx) => {
    const allSessions = await ctx.db.query("adminSessions").collect();
    const now = Date.now();

    const active = allSessions.filter(s => s.expiresAt > now);
    const expired = allSessions.filter(s => s.expiresAt <= now);

    return {
      total: allSessions.length,
      active: active.length,
      expired: expired.length,
      oldestActive: active.length > 0
        ? Math.min(...active.map(s => s.createdAt))
        : null,
      newestActive: active.length > 0
        ? Math.max(...active.map(s => s.createdAt))
        : null,
    };
  },
});
