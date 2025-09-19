/**
 * lib/content/loaders.ts
 *
 * Loads landing content and validates it with Zod.
 * - Build/dev: throws with readable errors if content is malformed.
 * - Future: replace the import with a CMS fetch, then validate the remote JSON with the same schema.
 */
import type { HomeContent } from "@/types/content"; // legacy app-wide type
import { homeContent } from "@/content/home"; // current local content-as-code source
import { HomeContentSchema, type HomeContentZ } from "@/lib/content/schema"; // Zod schema + inferred type

/**
 * Validate and return the Home content.
 *
 * Notes for maintainers and AIs:
 * - Prefer `safeParse` if you want to handle errors without throwing.
 * - We use `.parse()` here to fail fast during build/CI when content is invalid.
 * - If you introduce a CMS, map the raw payload to this shape first, then validate.
 */
export async function getHomeContent(): Promise<HomeContent> {
  const parsed: HomeContentZ = HomeContentSchema.parse(homeContent);
  // Return as the legacy HomeContent type; shapes are aligned.
  return parsed as HomeContent;
}
