/**
 * lib/env/schema.ts
 * Environment variable schemas for AWS Amplify deployment.
 *
 * All secrets are managed through AWS Amplify Console: Hosting → Secrets
 * and made available as environment variables during the build process.
 */
import { z } from "zod";

/**
 * Server-side environment variables schema.
 * These are injected by AWS Amplify during build from configured secrets.
 */
export const ServerEnvSchema = z.object({
  /** Perplexity API key for chat functionality */
  PPLX: z.string().optional(),

  /** Convex deployment ID (reserved for future use) */
  CONVEX_DEPLOYMENT: z.string().optional(),

  /** Convex URL (reserved for future use) */
  CONVEX_URL: z.string().optional(),

  /** Google Maps API key for server-side operations */
  GOOGLE_MAPS_API_KEY: z.string().optional(),

  /** AWS Amplify environment identifier */
  AMPLIFY_ENV: z.string().optional(),

  /** Node.js environment */
  NODE_ENV: z.enum(["development", "production", "test"]).optional()
});

/**
 * Public (client-side) environment variables schema.
 * These must be prefixed with NEXT_PUBLIC_ to be available in the browser.
 */
export const PublicEnvSchema = z.object({
  /** Google Maps API key for client-side map components */
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional()
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PublicEnv = z.infer<typeof PublicEnvSchema>;