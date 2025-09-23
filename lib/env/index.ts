/**
 * lib/env/index.ts
 * Environment variable validation for AWS Amplify deployment.
 *
 * This module provides non-blocking validation of environment variables.
 * AWS Amplify injects secrets as environment variables at runtime,
 * so build-time validation should not fail the build process.
 */
import { PublicEnvSchema, ServerEnvSchema, type PublicEnv, type ServerEnv } from "@/lib/env/schema";

// Non-blocking validation for server environment variables
const serverParsed = ServerEnvSchema.safeParse(process.env);
if (!serverParsed.success) {
  // Log warnings but don't fail the build
  console.warn("Server environment validation warnings (non-blocking):",
    JSON.stringify(serverParsed.error.format(), null, 2));
}

// Non-blocking validation for public environment variables
const publicParsed = PublicEnvSchema.safeParse(process.env);
if (!publicParsed.success) {
  // Log warnings but don't fail the build
  console.warn("Public environment validation warnings (non-blocking):",
    JSON.stringify(publicParsed.error.format(), null, 2));
}

/**
 * Environment variables object with fallbacks.
 * Uses parsed data when available, falls back to empty object.
 * Individual API routes should validate their required secrets at runtime.
 */
export const env: Partial<ServerEnv & PublicEnv> = {
  ...serverParsed.data,
  ...publicParsed.data
};