/**
 * lib/env/index.ts
 * Environment variable validation for AWS Amplify deployment.
 *
 * This module validates environment variables that are injected by AWS Amplify
 * during the build process from secrets configured in the Amplify Console.
 *
 * Import this file in server contexts (e.g., app/layout.tsx) to validate
 * environment configuration during build/runtime initialization.
 */
import { PublicEnvSchema, ServerEnvSchema, type PublicEnv, type ServerEnv } from "@/lib/env/schema";

// Validate server environment variables
const serverParsed = ServerEnvSchema.safeParse(process.env);
if (!serverParsed.success) {
  console.warn("Environment validation warnings:", JSON.stringify(serverParsed.error.format(), null, 2));
  // Don't throw error for missing optional environment variables in Amplify deployment
}

// Validate public environment variables
const publicParsed = PublicEnvSchema.safeParse(process.env);
if (!publicParsed.success) {
  console.warn("Public environment validation warnings:", JSON.stringify(publicParsed.error.format(), null, 2));
  // Don't throw error for missing optional environment variables in Amplify deployment
}

/**
 * Validated environment variables object.
 * Contains both server and public environment variables.
 */
export const env: ServerEnv & PublicEnv = {
  ...serverParsed.data,
  ...publicParsed.data
};