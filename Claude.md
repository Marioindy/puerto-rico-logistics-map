# Claude Guide — Zod + Content Patterns

Dear agent, this project validates content and external data with Zod. Follow these guardrails:

- Never trust runtime data. Validate with the appropriate Zod schema before using it in a component.
- For landing content:
  - Source: `content/home.ts` (content-as-code)
  - Schema: `lib/content/schema.ts`
  - Loader: `lib/content/loaders.ts` (calls `.parse()` to fail fast)
- If you introduce a CMS:
  - Fetch JSON ? map to section contracts ? `HomeContentSchema.safeParse(payload)`
  - Prefer `.safeParse` in user-facing flows to return friendly error objects.

Authoring schemas
- Co-locate by domain (e.g., `lib/content/schema.ts`, later `lib/env/schema.ts`).
- Export inferred types: `export type HomeContentZ = z.infer<typeof HomeContentSchema>`.
- Add specific `.refine()` rules (e.g., CTA href must be URL, `/path`, or `#anchor`).

When editing pages
- Keep `app/*/page.tsx` thin; import “page barrels” from `components/pages/*`.
- Server load content with the loader; pass parsed props to section components.
- Mark interactive components with `"use client"`.

Diagnostics
- Validation errors throw with a readable path (e.g., `benefits.items[2]`), visible during `npm run build` on Amplify.
- Use `result.error.format()` for structured messages if you convert `.parse()` to `.safeParse()`.

