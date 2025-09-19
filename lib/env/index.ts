/**
 * lib/env/index.ts
 * Centralized env validation. Import in a SERVER context (e.g., app/layout.tsx)
 * to fail fast during build/dev if required variables are missing.
 *
 * Do NOT import this file in client components; it reads process.env directly.
 */
import { PublicEnvSchema, ServerEnvSchema, type PublicEnv, type ServerEnv } from "@/lib/env/schema";

const serverParsed = ServerEnvSchema.safeParse(process.env);
if (!serverParsed.success) {
  // Pretty-print Zod errors for CI logs
  throw new Error(`Invalid server env. Fix the following:\n${JSON.stringify(serverParsed.error.format(), null, 2)}`);
}

const publicParsed = PublicEnvSchema.safeParse(process.env);
if (!publicParsed.success) {
  throw new Error(`Invalid public env. Fix NEXT_PUBLIC_* keys:\n${JSON.stringify(publicParsed.error.format(), null, 2)}`);
}

export const env: ServerEnv & PublicEnv = {
  ...serverParsed.data,
  ...publicParsed.data
};
