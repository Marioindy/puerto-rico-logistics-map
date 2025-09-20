/**
 * lib/env/index.ts
 * Centralized env validation. Import in a SERVER context (e.g., app/layout.tsx)
 * to fail fast during build/dev if required variables are missing.
 *
 * Do NOT import this file in client components; it reads process.env directly.
 */
import { PublicEnvSchema, ServerEnvSchema, type PublicEnv, type ServerEnv } from "@/lib/env/schema";

// Function to get environment variables from either Amplify secrets or process.env
function getEnvValue(secretName: string, envName: string): string | undefined {
  // Try AWS Amplify secrets first (for production)
  try {
    // Use synchronous import to avoid top-level await
    const amplifyBackend = require("@aws-amplify/backend");
    const amplifyValue = amplifyBackend.secret?.(secretName);
    if (amplifyValue) {
      return amplifyValue;
    }
  } catch {
    // @aws-amplify/backend not available or secret not found, fallback to env vars
  }

  // Fallback to environment variables (for local development)
  return process.env[envName];
}

// Create enhanced process.env with Amplify secrets
function createEnhancedEnv() {
  const enhancedEnv = { ...process.env };

  // Map Amplify secret names to environment variable names
  const secretMappings = [
    { secretName: 'PPLX', envName: 'PPLX' },
    { secretName: 'CONVEX_DEPLOYMENT', envName: 'CONVEX_DEPLOYMENT' },
    { secretName: 'CONVEX_URL', envName: 'CONVEX_URL' },
    { secretName: 'GOOGLE_MAPS_API_KEY', envName: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY' }
  ];

  // Get values from secrets or env vars
  for (const { secretName, envName } of secretMappings) {
    const value = getEnvValue(secretName, envName);
    if (value) {
      enhancedEnv[envName] = value;
    }
  }

  return enhancedEnv;
}

// Create and validate environment
const enhancedEnv = createEnhancedEnv();

const serverParsed = ServerEnvSchema.safeParse(enhancedEnv);
if (!serverParsed.success) {
  // Pretty-print Zod errors for CI logs
  throw new Error(`Invalid server env. Fix the following:\n${JSON.stringify(serverParsed.error.format(), null, 2)}`);
}

const publicParsed = PublicEnvSchema.safeParse(enhancedEnv);
if (!publicParsed.success) {
  throw new Error(`Invalid public env. Fix NEXT_PUBLIC_* keys:\n${JSON.stringify(publicParsed.error.format(), null, 2)}`);
}

export const env: ServerEnv & PublicEnv = {
  ...serverParsed.data,
  ...publicParsed.data
};
