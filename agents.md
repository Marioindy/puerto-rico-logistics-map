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
  - `content/`: Zod schemas + loaders for content and RFI data
    - `schema.ts`: Zod schemas including `RfiLocationSchema`
    - `loaders.ts`: Content loaders including `getRfiLocations()`
    - `rfi-locations.json`: Extracted RFI survey data with valid GPS coordinates
  - `facilityData.ts`: RFI markers and helpers
- `content/`: content-as-code (currently `home.ts`)
- `types/`: shared TypeScript types (`content`, `facilities`, etc.)
- `styles/`: Tailwind/global CSS
- `convex/`: Convex backend functions and schema
  - `schema.ts`: Database schema definition (source of truth)
  - `facilities.ts`: Facility queries and mutations
  - `functions/`: Organized function modules
  - `_generated/`: Auto-generated TypeScript types (do not edit)

## Zod Validation (Runtime + Types)
- Content schema: `lib/content/schema.ts`
- Content loader: `lib/content/loaders.ts` (throws on invalid content)
- Env schema: `lib/env/schema.ts`
- Env loader: `lib/env/index.ts` (imported by `app/layout.tsx` to fail fast during build)
- Infer types with `z.infer` to keep runtime validation and TypeScript aligned.

## Build & Editing Guardrails
- Avoid literal escape sequences (`\n`, `` `r`n ``) in files; use here-strings or actual newlines.
- Always write source files with UTF-8 (no BOM). `.gitattributes` enforces LF for source files.
- Run `pnpm run typecheck` and `pnpm run build` locally before pushing when making structural changes.
- Prefer using your editor for edits; if scripting with PowerShell, use here-strings and `Set-Content -Encoding UTF8`.

## Assistant (Perplexity)
- Server route: `app/api/chat/route.ts`.
  - Resolve the API key with `secret("PPLX")` from `@aws-amplify/backend`, validate it is a non-empty string, and fall back to `process.env.PPLX` for local overrides.
  - Return clear 500 responses when the secret is missing or malformed before forwarding requests to Perplexity.
- Client: `components/ChatbotFab.tsx` (mounted on RFI map) with enhanced debug output for failed chats.
- Env keys:
  - `PPLX` (server-only secret)
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client)
  - `ADMIN_SECRET_KEY` (server-only, protects Convex admin mutations)
- To test without the service, stub `/api/chat` to return a canned payload.

## Convex Backend
- **Schema File**: `convex/schema.ts` (source of truth for database structure)
- **Development**: `npx convex dev` (watches for changes, pushes schema, regenerates types)
- **Deployment**: `npx convex deploy`

### Database Tables
All Convex tables automatically include `_id` and `_creationTime` fields.

**Architecture**: Three-table hierarchy for flexible facility data:
```
geoLocales → facilityBoxes → facilityVariables
```

1. **geoLocales**: Main facilities/locations (warehouses, ports, airports, facilities)
   - Fields: name, type, coordinates {lat, lng}, description, region, isActive
   - Indexes: by_name, by_type, by_region, by_isActive
   - Primary table for map display
   - Queries in `convex/geoLocales.ts`:
     - `list()` - filtered location list
     - `listWithDetails()` - locations WITH boxes WITH variables (for UI panel)
     - `getById()` / `getByIdWithDetails()` - single location lookups
   - Admin mutations in `convex/geoLocales.ts` (require `ADMIN_SECRET_KEY`):
     - `adminCreate()` - create location
     - `adminUpdate()` - update location
     - `adminDelete()` - delete location (cascades to boxes and variables)

2. **facilityBoxes**: UI organization containers
   - Fields: geoLocaleId (ref), title, icon, color, sortOrder
   - Links to geoLocales, defines visual grouping with icons/colors for FacilityInfoPanel
   - Icons: Info, Settings, Eye, MapPin, Database, Monitor
   - Colors: blue, green, orange, purple, red, gray, cyan, indigo
   - Queries in `convex/facilityBoxes.ts`:
     - `getByGeoLocaleId()` - boxes for a location
     - `getById()` - single box
   - Admin mutations in `convex/facilityBoxes.ts` (require `ADMIN_SECRET_KEY`):
     - `adminCreate()` - create box
     - `adminUpdate()` - update box
     - `adminDelete()` - delete box (cascades to variables)

3. **facilityVariables**: Dynamic facility metadata
   - Fields: boxId (ref), key, label, type, value (optional), sortOrder, parentVariableId (optional), unit, unitCategory
   - Types: text, email, number, coordinates, nested
   - Supports nested variables (parent-child relationships) for hierarchical data
   - Flexible key-value storage for facility attributes (capacity, hours, etc.)
   - Queries in `convex/facilityVariables.ts`:
     - `getByBoxId()` - variables for a box
     - `getById()` - single variable
     - `getByKey()` - find by key
   - Admin mutations in `convex/facilityVariables.ts` (require `ADMIN_SECRET_KEY`):
     - `adminCreate()` - create variable (validates type, parent)
     - `adminUpdate()` - update variable (prevents self-referencing)
     - `adminDelete()` - delete variable (cascades to children)

4. **shipments**: Cargo tracking
   - Fields: reference, createdByEmail, originGeoId (ref), destinationGeoId (ref), mode, status, timestamps, tracking details, cargo specs
   - Indexes: by_reference, by_status, by_originGeoId, by_destinationGeoId
   - Full logistics data: origin/destination, modes, status, weights, tracking numbers

### Schema Workflow
- Edit `convex/schema.ts` locally
- Run `npx convex dev` to push changes
- Convex validates existing data against new schema
- Types auto-generate in `convex/_generated/`
- Dashboard edits must match schema or validation fails

### Admin Mutations Security

**Implementation Date**: 2025-10-02

All database write operations are protected by admin mutations requiring `ADMIN_SECRET_KEY`.

**Files Created**:
- `convex/geoLocales.ts` - Added 3 admin mutations (adminCreate, adminUpdate, adminDelete)
- `convex/facilityBoxes.ts` - Created with 3 admin mutations + 2 queries
- `convex/facilityVariables.ts` - Created with 3 admin mutations + 3 queries
- `convex/README.md` - Comprehensive API documentation (1050 lines)

**Security Implementation**:
- All admin mutations (create, update, delete) require `ADMIN_SECRET_KEY` environment variable
- Set in Convex dashboard (Settings → Environment Variables) for production
- Set in `.env.local` for local development
- Key is validated before any mutation executes via `validateAdminKey()` helper
- Unauthorized access throws `ConvexError("Unauthorized access")`
- Missing configuration throws `ConvexError("Admin functionality not configured")`
- Never expose `ADMIN_SECRET_KEY` in client-side code
- All mutations include validation logic:
  - Foreign key checks (parent records must exist)
  - Type validation (variable types, etc.)
  - Self-referencing prevention (variables)
  - Cascade deletes (maintains referential integrity)

**Cascade Delete Behavior**:
- Deleting geoLocale → deletes all facilityBoxes → deletes all facilityVariables
- Deleting facilityBox → deletes all facilityVariables for that box
- Deleting facilityVariable → recursively deletes all child variables

For complete usage examples and API reference, see `convex/README.md`.

### RFI Survey Data
- **Source**: `docs/RFI MAP/RFI Responses (NEW 69 Responses).xlsx`
- **Extracted**: 4 facilities with valid coordinates → `lib/content/rfi-locations.json`
- **Schema**: `RfiLocationSchema` validates GPS coordinates within PR bounds
- **Access**: Use `getRfiLocations()` from `lib/content/loaders.ts`

## Contribution Checklist
- Respect page structure (see Page Creation Protocol).
- Add/update Zod schemas when introducing new content or env requirements.
- Keep shared types in sync with schemas (prefer `z.infer`).
- When modifying Convex schema, run `npx convex dev` to validate and regenerate types.
- Update docs (`README.md`, `agents.md`, `Claude.md`) whenever architecture or conventions change.


