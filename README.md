# Puerto Rico Logistics Grid

Foundational scaffolding for a Next.js App Router workspace wired to Convex, Amplify, Google Maps, Tailwind, and TypeScript. The code is intentionally light so teams can plug in agency-specific flows without reworking the structure.

## Stack Outline
- **Next.js 15.5.3** - App Router for layouts, routing, and streaming dashboards
- **Convex** - Serverless backend for data, queries, mutations, and real-time updates
- **AWS Amplify** - Hosting and deployment
- **Google Maps** - Geospatial overlays and interactive mapping
- **Tailwind CSS v4** - Design tokens and rapid UI work
- **TypeScript** - Type safety end-to-end
- **Zod** - Runtime validation for content and environment variables

## Project Layout
```
app/
  homepage/
    components/
      CTA.tsx
      Benefits.tsx
      Contact.tsx
      Hero.tsx
      RFIPreview.tsx
      SpecsRail.tsx
    homepage.tsx         # Home page composition
    page.tsx             # Re-exports homepage.tsx for Next.js routing
  rfimap/
    components/
      FacilityInfoPanel.tsx
      MapFilterPanel.tsx
    rfimap.tsx           # RFI map workspace
    page.tsx             # Re-exports rfimap.tsx
  layout.tsx             # Global shell (imports env validation)
  page.tsx               # Root route re-export (points to homepage/page)
components/
  Header.tsx             # Global header
  InteractiveMap.tsx     # Full map surface (RFI)
  MapView.tsx            # Landing preview map
content/
  home.ts                # Typed content-as-code for landing page
lib/
  content/
    loaders.ts           # Fetch + validate Home content
    schema.ts            # Zod schemas for Home content
    rfi-locations.json   # Extracted RFI survey data (4 facilities)
  env/
    index.ts             # Validates env vars at build/runtime
    schema.ts            # Zod env schemas
  facilityData.ts        # RFI map markers and helpers
convex/
  schema.ts              # Database schema (source of truth)
  geoLocales.ts          # Location queries + admin mutations
  facilityBoxes.ts       # Box queries + admin mutations
  facilityVariables.ts   # Variable queries + admin mutations
  README.md              # Complete Convex API documentation
  _generated/            # Auto-generated types (do not edit)
styles/
  globals.css
```

### Page/Component Convention
> Only two pages currently exist: Main Landing Page and RFI Map.

For any new page:
```
app/<page-name>/<page-name>.tsx      # Page implementation (can be server or client)
app/<page-name>/page.tsx             # Re-export wrapper required by Next.js
app/<page-name>/components/          # Components unique to that page
```
Shared UI belongs in `components/`. Do not add placeholders-only commit folders/files once they contain real code.

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and set:
```bash
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Admin access (server-only)
ADMIN_SECRET_KEY=your-secure-random-string

# Google Maps (client)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### 3. Start Convex
```bash
npx convex dev
```
This will:
- Push your schema to Convex
- Set up the database tables
- Generate TypeScript types in `convex/_generated/`
- Watch for changes

### 4. Set Convex Environment Variable
```bash
npx convex env set ADMIN_SECRET_KEY "your-secure-random-string"
```

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000)

## Convex Backend

### Architecture

The Convex backend uses a **three-table hierarchy** for flexible facility data:

```
geoLocales (locations)
  └─ facilityBoxes (UI sections)
       └─ facilityVariables (dynamic attributes)
```

### Database Tables

1. **geoLocales** - Main facilities/locations (warehouses, ports, airports)
   - Fields: name, type, coordinates, description, region, isActive
   - Indexes: by_name, by_type, by_region, by_isActive

2. **facilityBoxes** - UI organization containers for FacilityInfoPanel
   - Fields: geoLocaleId, title, icon, color, sortOrder
   - Links visual sections to locations

3. **facilityVariables** - Dynamic facility metadata
   - Fields: boxId, key, label, type, value, sortOrder, parentVariableId
   - Supports nested variables for hierarchical data

4. **shipments** - Cargo tracking between facilities
   - Fields: reference, origin/destination, mode, status, tracking details

### Admin Mutations (Protected)

All database write operations require `ADMIN_SECRET_KEY` authentication:

**geoLocales**:
- `adminCreate()` - Create location
- `adminUpdate()` - Update location
- `adminDelete()` - Delete location (⚠️ cascades to boxes → variables)

**facilityBoxes**:
- `adminCreate()` - Create box
- `adminUpdate()` - Update box
- `adminDelete()` - Delete box (⚠️ cascades to variables)

**facilityVariables**:
- `adminCreate()` - Create variable
- `adminUpdate()` - Update variable
- `adminDelete()` - Delete variable (⚠️ cascades to children)

**Security Features**:
- API key validation before execution
- Foreign key checks (ensures parent records exist)
- Type validation
- Cascade deletes (maintains referential integrity)
- Self-referencing prevention

For complete API documentation, usage examples, and troubleshooting, see [convex/README.md](convex/README.md).

### Convex Commands

```bash
# Development
npx convex dev              # Watch mode
npx convex dev --once       # One-time push
npx convex deploy           # Deploy to production

# Environment variables
npx convex env set KEY value    # Set variable
npx convex env get KEY          # Get variable
npx convex env list             # List all

# Help
npx convex -h               # CLI help
npx convex docs             # Open docs
```

### Environment Variables Reference

**Local Development** (`.env.local`):
- `CONVEX_DEPLOYMENT` - Convex deployment ID
- `NEXT_PUBLIC_CONVEX_URL` - Convex API URL (client)
- `ADMIN_SECRET_KEY` - Admin mutation authentication (server-only)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps key (client)

**Production** (Convex Dashboard):
- Set `ADMIN_SECRET_KEY` in Settings → Environment Variables

**Production** (Amplify Hosting):
- Add all variables in Hosting → Environment variables
- Do NOT prefix server-only variables with `NEXT_PUBLIC_`

### Amplify secrets
- Create SecureString parameters manually at /amplify/<app-id>/<branch>/<SECRET_NAME> (no branch-hash suffix) so Amplify picks them up.
- Grant the Amplify service role ssm:GetParametersByPath permission on that prefix to allow build-time access.
- During preBuild, the amplify.yml build script parses the secrets JSON payload and exports CONVEX_URL, NEXT_PUBLIC_CONVEX_URL, CONVEX_DEPLOYMENT, CONVEX_DEPLOY_KEY, and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, writing them to .env.local and .env.production for Next.js.
- Keep secret names aligned with the runtime env var keys; the build step falls back to existing env vars if a secret is missing.
