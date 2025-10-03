/**
 * lib/env/schema.ts
 * Environment variable schemas for local development and AWS Amplify deployment.
 */
import { z } from "zod";

/**
 * Server-side environment variables schema.
 */
export const ServerEnvSchema = z.object({
  /** Convex deployment ID */
  CONVEX_DEPLOYMENT: z.string().optional(),

  /** Convex URL */
  CONVEX_URL: z.string().optional(),

  /** Admin secret key for protected Convex mutations */
  ADMIN_SECRET_KEY: z.string().optional(),

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