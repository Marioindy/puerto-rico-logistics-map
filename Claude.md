# Claude Guide — Repo Conventions

## Architecture
- Two pages only: landing (`app/homepage`) and RFI map (`app/rfimap`).
- Each page folder contains:
  - `<name>.tsx` (actual page implementation)
  - `page.tsx` (`export { default } from "./<name>";`)
  - `components/` for page-specific components (do not leave placeholders).
- Shared widgets live in `components/` (e.g., `InteractiveMap`, `MapView`, `Header`, `ChatbotFab`).

## Zod Usage
- Content schemas: `lib/content/schema.ts`; loader: `lib/content/loaders.ts`.
- Env schemas: `lib/env/schema.ts`; loader: `lib/env/index.ts` (imported by `app/layout.tsx`).
- Always use `safeParse`/`parse` before trusting external data.
- Infer types with `z.infer<typeof Schema>` to keep TS and runtime aligned.

## Page Editing Rules
- Never add new routes outside the convention above.
- Landing page code lives in `app/homepage/homepage.tsx` and its components in `app/homepage/components/`.
- RFI map workspace lives in `app/rfimap/rfimap.tsx` with its unique components under `app/rfimap/components/`.

## Env Keys
- `PPLX`: server-only Perplexity key (used in `app/api/chat/route.ts`).
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: client map key (used in `MapView` and `InteractiveMap`).
- Optional placeholders: `CONVEX_DEPLOYMENT`, `AMPLIFY_ENV`.

## Editing & Build Hygiene
- Avoid literal escape sequences (`\n`, `` `r`n ``); write real newlines.
- Save source files as UTF-8 without BOM (PowerShell: `Set-Content -Encoding UTF8`).
- Run `npm run typecheck` and `npm run build` locally before pushing structural changes.
- If automating edits, prefer here-strings and keep docs (`README.md`, `agents.md`, `Claude.md`) in sync.
