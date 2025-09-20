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

// ============== RFI MAP SCHEMAS ==============

/** Facility variable schema for dynamic form fields */
export const FacilityVariableSchema: z.ZodType<{
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'coordinates' | 'nested';
  value?: string | number;
  unit?: string;
  unitCategory?: 'distance' | 'area' | 'time' | 'capacity' | 'volume' | 'power' | 'percentage';
  icon?: string;
  color?: string;
  subVariables?: any[];
}> = z.lazy(() => z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'number', 'coordinates', 'nested']),
  value: z.union([z.string(), z.number()]).optional(),
  unit: z.string().optional(),
  unitCategory: z.enum(['distance', 'area', 'time', 'capacity', 'volume', 'power', 'percentage']).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  subVariables: z.array(FacilityVariableSchema).optional()
}));

/** Facility box schema for grouping related variables */
export const FacilityBoxSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  variables: z.array(FacilityVariableSchema).min(1)
});

/** Main facility data schema */
export const FacilityDataSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  boxes: z.array(FacilityBoxSchema).min(1)
});

/** Coordinates schema for geographic positioning */
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

/** Selected pin schema for map markers */
export const SelectedPinSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['airport', 'port', 'warehouse', 'facility']),
  coordinates: CoordinatesSchema,
  data: FacilityDataSchema.optional()
});

/** Map filter state schema for filter panel controls */
export const MapFilterStateSchema = z.object({
  types: z.record(z.string(), z.boolean()),
  ids: z.record(z.string(), z.boolean())
});

/** Facilities database schema */
export const FacilitiesDatabaseSchema = z.record(z.string(), FacilityDataSchema);

/** Map markers array schema */
export const MapMarkersSchema = z.array(SelectedPinSchema);

/** Facility summary stats schema */
export const FacilitySummarySchema = z.object({
  totalFacilities: z.number().int().min(0),
  totalRFIResponses: z.number().int().min(0),
  facilitiesWithStorage: z.number().int().min(0),
  manufacturers: z.number().int().min(0),
  cargoOperators: z.number().int().min(0),
  temperatureControlled: z.number().int().min(0),
  freeTradeZones: z.number().int().min(0),
  operating24x7: z.number().int().min(0)
});

// Inferred TypeScript types
export type FacilityVariableZ = z.infer<typeof FacilityVariableSchema>;
export type FacilityBoxZ = z.infer<typeof FacilityBoxSchema>;
export type FacilityDataZ = z.infer<typeof FacilityDataSchema>;
export type CoordinatesZ = z.infer<typeof CoordinatesSchema>;
export type SelectedPinZ = z.infer<typeof SelectedPinSchema>;
export type MapFilterStateZ = z.infer<typeof MapFilterStateSchema>;
export type FacilitiesDatabaseZ = z.infer<typeof FacilitiesDatabaseSchema>;
export type MapMarkersZ = z.infer<typeof MapMarkersSchema>;
export type FacilitySummaryZ = z.infer<typeof FacilitySummarySchema>;
