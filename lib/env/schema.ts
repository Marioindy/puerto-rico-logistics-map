/**
 * lib/env/schema.ts
 * Zod schemas for validating server and public environment variables.
 *
 * Keep secrets (no NEXT_PUBLIC_) in ServerEnvSchema.
 * Only client-safe keys (prefixed NEXT_PUBLIC_) belong in PublicEnvSchema.
 */
import { z } from "zod";

export const ServerEnvSchema = z.object({
  /** Perplexity API key used by server route /api/chat. Never expose to the browser. */
  PPLX: z.string().min(1, "Missing PPLX (Perplexity API key)"),
  /** Optional Convex deploy id; currently unused but reserved. */
  CONVEX_DEPLOYMENT: z.string().optional(),
  /** Optional Amplify environment label. */
  AMPLIFY_ENV: z.string().optional()
});

export const PublicEnvSchema = z.object({
  /** Google Maps key required by client-side Map components. */
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z
    .string()
    .min(1, "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PublicEnv = z.infer<typeof PublicEnvSchema>;
