# Repository Agents Guide

This document keeps contributors (human or AI) aligned on structure, validation, and guardrails.

## Architecture Overview

Only two pages currently exist and must remain modular:

```
app/
  homepage/
    components/          # Components unique to the landing page
    homepage.tsx         # Landing page implementation
    page.tsx             # Next.js entry (re-exports homepage.tsx)
  rfimap/
    components/          # Components unique to the RFI map workspace
    rfimap.tsx           # RFI map implementation (client page)
    page.tsx             # Next.js entry (re-exports rfimap.tsx)
  api/
    chat/route.ts        # Perplexity proxy
  layout.tsx             # Global shell (imports env validation)
  page.tsx               # Root route re-export -> homepage/page
```

Shared, reusable UI lives in `components/` (e.g., `InteractiveMap`, `MapView`, `Header`, `ChatbotFab`).

### Page Creation Protocol
When adding a new page, follow this exact structure (no placeholders):
```
app/<page-name>/<page-name>.tsx      # Page implementation
app/<page-name>/page.tsx             # `export { default } from "./<page-name>";`
app/<page-name>/components/          # Components unique to that page
```
If a page has no unique components yet, leave the `components/` folder empty but committed (or create it when needed). Do not create stub pages.

## Shared Directories
- `components/`: shared widgets used by multiple pages (`Header`, `ChatbotFab`, `InteractiveMap`, etc.).
- `lib/`: shared utilities
  - `env/`: Zod schemas + validation for environment variables
  - `content/`: Zod schemas + loader for landing content
  - `facilityData.ts`: RFI markers and helpers
- `content/`: content-as-code (currently `home.ts`)
- `types/`: shared TypeScript types (`content`, `facilities`, etc.)
- `styles/`: Tailwind/global CSS

## Zod Validation (Runtime + Types)
- Content schema: `lib/content/schema.ts`
- Content loader: `lib/content/loaders.ts` (throws on invalid content)
- Env schema: `lib/env/schema.ts`
- Env loader: `lib/env/index.ts` (imported by `app/layout.tsx` to fail fast during build)
- Infer types with `z.infer` to keep runtime validation and TypeScript aligned.

## Build & Editing Guardrails
- Avoid literal escape sequences (`\n`, `` `r`n ``) in files; use here-strings or actual newlines.
- Always write source files with UTF-8 (no BOM). `.gitattributes` enforces LF for source files.
- Run `npm run typecheck` and `npm run build` locally before pushing when making structural changes.
- Prefer using your editor for edits; if scripting with PowerShell, use here-strings and `Set-Content -Encoding UTF8`.

## Assistant (Perplexity)
- Server route: `app/api/chat/route.ts` (uses `process.env.PPLX`).
- Client: `components/ChatbotFab.tsx` (mounted on RFI map).
- Env keys:
  - `PPLX` (server-only)
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client)
- To test without the service, stub `/api/chat` to return a canned payload.

## Contribution Checklist
- Respect page structure (see Page Creation Protocol).
- Add/update Zod schemas when introducing new content or env requirements.
- Keep shared types in sync with schemas (prefer `z.infer`).
- Update docs (`README.md`, `agents.md`, `Claude.md`) whenever architecture or conventions change.
