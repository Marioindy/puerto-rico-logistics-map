/**
 * lib/content/schema.ts
 *
 * Zod schemas for strongly typing and validating landing content.
 *
 * Why Zod? TypeScript catches mistakes at compile time, but content/data can be wrong at runtime
 * (CMS entries, JSON, env vars). Zod gives us one source of truth for both runtime validation and
 * static types (via z.infer). If content is malformed, we fail fast with a readable error.
 */

import { z } from "zod";

/** A CTA button or link. Accepts absolute URLs, hash links, or site-relative paths. */
export const CtaSchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  href: z
    .string()
    .min(1, "CTA href is required")
    .refine(
      (v) => /^(https?:\/\/|\/|#)/.test(v),
      "href must be an absolute URL, a site-relative path starting with /, or an in-page anchor starting with #"
    )
});

export const HeroSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  primary: CtaSchema,
  secondary: CtaSchema.optional()
});

export const RfiPreviewSchema = z.object({
  title: z.string().min(1),
  cta: CtaSchema,
  zoom: z.number().int().min(1).max(20).default(8)
});

export const BenefitsSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
  imageUrl: z.string().url("imageUrl must be a valid URL")
});

export const SpecsRailSchema = z.object({
  imageUrl: z.string().url(),
  links: z.array(CtaSchema).min(1)
});

export const CtaContentSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  cta: CtaSchema
});

export const ContactSchema = z.object({
  title: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7)
});

/** Root schema for the landing page content. */
export const HomeContentSchema = z.object({
  hero: HeroSchema,
  logos: z.array(z.string().min(1)).min(1),
  rfiPreview: RfiPreviewSchema,
  benefits: BenefitsSchema,
  specs: SpecsRailSchema,
  how: CtaContentSchema,
  contact: ContactSchema
});

/**
 * Export an inferred TypeScript type directly from the schema.
 * This guarantees types always match runtime validation.
 */
export type HomeContentZ = z.infer<typeof HomeContentSchema>;
