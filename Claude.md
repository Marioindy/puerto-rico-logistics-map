# Claude Guide � Repo Conventions

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

## Secrets & Environment Variables
- `PPLX`: server-only Perplexity key (used in `app/api/chat/route.ts`).
  - **Production**: Set as Secret in Amplify console (Hosting → Secrets)
  - **Local dev**: Use `pnpx ampx sandbox secret set PPLX` or add to `.env.local`
  - **Code**: Access via `secret("PPLX")` from `@aws-amplify/backend`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: client map key (used in `MapView` and `InteractiveMap`).
- `CONVEX_DEPLOYMENT`: Convex deployment ID for database connection.
  - **Production**: Set as Secret in Amplify console (e.g., `prod:your-deployment-name-123`)
  - **Local dev**: Auto-populated by `pnpx convex dev` in `.env.local`
- `CONVEX_URL`: Convex backend URL.
  - **Production**: Set as Secret in Amplify console (e.g., `https://your-project.convex.cloud`)
  - **Local dev**: Auto-populated by `pnpx convex dev` in `.env.local`

## AWS Amplify Secrets
⚠️ **Important**: Use Secrets for sensitive data (API keys), not Environment Variables.
See `docs/AMPLIFY_SECRETS.md` for complete setup guide.

## Convex Database Integration
- **Schema**: `convex/schema.ts` defines GeoLocales, FacilityBoxes, and FacilityVariables tables.
- **Functions**: `convex/functions/geoLocales/` contains queries, mutations, and seeding functions.
- **Deployment**: `amplify.yml` automatically deploys Convex on build with `pnpx convex deploy --prod`.
- **Local Development**: Run `pnpx convex dev` to start development database.
- **Seeding**: Use `pnpx convex run geoLocalesSeed:seedSampleGeoLocales` to populate sample data.

⚠️ **CRITICAL CONVEX RULE**: ALWAYS AND ALWAYS EXPLICITLY READ `convex/convex_rules.txt` BEFORE writing ANY Convex query, mutation, action, or schema code. This file contains essential syntax rules, validators, function registration patterns, and best practices that are EXTREMELY IMPORTANT and MUST be followed exactly. Failure to read and follow these rules will result in broken code.

## Editing & Build Hygiene
- Avoid literal escape sequences (`\n`, `` `r`n ``); write real newlines.
- Save source files as UTF-8 without BOM (PowerShell: `Set-Content -Encoding UTF8`).
- Run `pnpm run typecheck` and `pnpm run build` locally before pushing structural changes.
- If automating edits, prefer here-strings and keep docs (`README.md`, `agents.md`, `Claude.md`) in sync.
