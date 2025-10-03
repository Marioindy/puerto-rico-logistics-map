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

## Environment Variables
- `PPLX`: server-only Perplexity key (used in `app/api/chat/route.ts`).
  - **Production**: Set in Amplify console (Hosting -> Environment variables)
  - **Local dev**: Add to `.env.local`
  - **Code**: Access with `process.env.PPLX`, return descriptive 500 if missing or malformed.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: client map key (used in `MapView` and `InteractiveMap`).
- `ADMIN_SECRET_KEY`: server-only admin key for protected Convex mutations.
  - **Production**: Set in Convex dashboard (Settings -> Environment Variables)
  - **Local dev**: Add to `.env.local`
  - **Security**: This key protects all admin mutations (create, update, delete) for geoLocales, facilityBoxes, and facilityVariables.
- Optional placeholders: `CONVEX_DEPLOYMENT`, `AMPLIFY_ENV`.

## AWS Amplify Configuration
Set environment variables in Amplify console under Hosting → Environment variables.
See `docs/AMPLIFY_SECRETS.md` for complete setup guide.

## RFI Survey Data
- **Source**: Excel file at `docs/RFI MAP/RFI Responses (NEW 69 Responses).xlsx` (69 total responses)
- **Extracted Data**: `lib/content/rfi-locations.json` (4 facilities with valid GPS coordinates)
- **Schema**: `RfiLocationSchema` in `lib/content/schema.ts`
- **Loader**: `getRfiLocations()` in `lib/content/loaders.ts`
- **Validation**: Zod validates coordinates are within Puerto Rico bounds (lat: 17.5-18.6, lng: -67.5 to -65.0)
- **Data Includes**:
  - UPS (Carolina Airport) - 18.4378041, -65.9916765
  - American Storage & Distribution (Cataño) - 18.4285, -66.1510
  - Allied Logistics Corp. (2 facilities in different locations)
- **Fields**: id, name, facilityName, type, address, coordinates, contact info, storage details, services, transport modes, cargo types, certifications, operating hours

## Convex Database
- **Schema File**: `convex/schema.ts`
- **Run Commands**:
  - Development: `npx convex dev` (watches for changes, pushes schema, regenerates types)
  - Deploy: `npx convex deploy`
  - Help: `npx convex -h`

### Convex Tables
All tables automatically include `_id` (unique identifier) and `_creationTime` (timestamp) fields.

#### Architecture: Three-Table Hierarchy
```
geoLocales (locations)
  └─ facilityBoxes (UI sections)
       └─ facilityVariables (dynamic attributes)
```

#### 1. `geoLocales` (main facilities/locations table)
- **Fields**: name, type, coordinates {lat, lng}, description, region, isActive
- **Indexes**: by_name, by_type, by_region, by_isActive
- **Types**: warehouse, port, airport, facility
- **Purpose**: Primary source for facility locations displayed on map
- **Queries**: `convex/geoLocales.ts`
  - `list()` - Basic location list with filters
  - `listWithDetails()` - Locations WITH boxes WITH variables (for FacilityInfoPanel)
  - `getById()` - Single location
  - `getByIdWithDetails()` - Single location with full details
- **Admin Mutations**: `convex/geoLocales.ts` (requires `ADMIN_SECRET_KEY`)
  - `adminCreate()` - Create new location
  - `adminUpdate()` - Update existing location
  - `adminDelete()` - Delete location (cascades to boxes and variables)

#### 2. `facilityBoxes` (UI organization)
- **Fields**: geoLocaleId (ref to geoLocales), title, icon, color, sortOrder
- **Index**: by_geoLocaleId
- **Icon Options**: Info, Settings, Eye, MapPin, Database, Monitor (from lucide-react)
- **Color Options**: blue, green, orange, purple, red, gray, cyan, indigo
- **Purpose**: Groups facility information into visual boxes/sections for FacilityInfoPanel display
- **Display**: Each box appears as an expandable section with icon and color coding
- **Queries**: `convex/facilityBoxes.ts`
  - `getByGeoLocaleId()` - Get all boxes for a location
  - `getById()` - Single box
- **Admin Mutations**: `convex/facilityBoxes.ts` (requires `ADMIN_SECRET_KEY`)
  - `adminCreate()` - Create new box
  - `adminUpdate()` - Update existing box
  - `adminDelete()` - Delete box (cascades to variables)

#### 3. `facilityVariables` (dynamic facility metadata)
- **Fields**: boxId (ref to facilityBoxes), key, label, type, value (optional), sortOrder, parentVariableId (optional, self-referencing), unit, unitCategory
- **Indexes**: by_boxId, by_key
- **Types**: text, email, number, coordinates, nested (nested variables have no value, act as parent containers)
- **Unit Categories**: distance, area, time, capacity, volume, power, percentage
- **Purpose**: Stores flexible, dynamic facility attributes (capacity, operating hours, dock doors, etc.)
- **Nested Support**: Variables can have subVariables for hierarchical organization
- **Queries**: `convex/facilityVariables.ts`
  - `getByBoxId()` - Get all variables for a box
  - `getById()` - Single variable
  - `getByKey()` - Find variables by key
- **Admin Mutations**: `convex/facilityVariables.ts` (requires `ADMIN_SECRET_KEY`)
  - `adminCreate()` - Create new variable (with validation)
  - `adminUpdate()` - Update existing variable (prevents self-referencing)
  - `adminDelete()` - Delete variable (cascades to child variables)

#### 4. `shipments` (cargo tracking)
- **Fields**: reference, createdByEmail, originGeoId (ref), destinationGeoId (ref), mode, status, etd, eta, atd (optional), ata (optional), trackingNumber (optional), bl (optional), awb (optional), weightKg (optional), volumeM3 (optional), pieces (optional), hazmat (optional), notes (optional)
- **Indexes**: by_reference, by_status, by_originGeoId, by_destinationGeoId
- **Modes**: air, sea, truck, multimodal
- **Statuses**: draft, booked, in_transit, arrived, delivered, cancelled
- **Purpose**: Track shipments between facilities with full logistics details

### Map Display Flow
1. User visits `/rfimap`
2. Page queries `api.geoLocales.listWithDetails()` with optional filters (type, region, search)
3. InteractiveMap renders markers at geoLocale coordinates
4. User clicks marker → FacilityInfoPanel opens
5. FacilityInfoPanel displays boxes (with icons/colors) → expandable variables

### Convex Schema Maintenance
- **Schema is source of truth**: Changes in `convex/schema.ts` are pushed to Convex, not pulled
- **Manual dashboard edits**: Data added via Convex dashboard must match the schema, or validation errors occur
- **Type generation**: Running `npx convex dev` regenerates TypeScript types in `convex/_generated/`
- **Schema updates**: When schema changes, Convex validates all existing documents against new schema

### Admin Mutations

**Implementation Date**: 2025-10-02

All database write operations (create, update, delete) are protected by admin mutations that require `ADMIN_SECRET_KEY` authentication.

#### Available Admin Mutations

**geoLocales** (3 mutations):
- `adminCreate()` - Create new location
- `adminUpdate()` - Update location (partial updates supported)
- `adminDelete()` - Delete location (⚠️ cascades to boxes → variables)

**facilityBoxes** (3 mutations):
- `adminCreate()` - Create new box (validates geoLocale exists)
- `adminUpdate()` - Update box (partial updates supported)
- `adminDelete()` - Delete box (⚠️ cascades to variables)

**facilityVariables** (3 mutations):
- `adminCreate()` - Create variable (validates type, parent, box)
- `adminUpdate()` - Update variable (prevents self-referencing)
- `adminDelete()` - Delete variable (⚠️ cascades to child variables)

#### Usage Example

```typescript
// From server-side actions or scripts
import { api } from "../convex/_generated/api";

export const createLocation = action({
  handler: async (ctx, args) => {
    const adminKey = process.env.ADMIN_SECRET_KEY!;

    const locationId = await ctx.runMutation(api.geoLocales.adminCreate, {
      adminKey,
      name: "New Warehouse",
      type: "warehouse",
      coordinates: { lat: 18.4, lng: -66.0 },
      description: "A new warehouse facility",
      region: "north",
      isActive: true,
    });

    return locationId;
  },
});
```

#### Security Features

- ✅ **API Key Validation**: All mutations validate `ADMIN_SECRET_KEY` before execution
- ✅ **Foreign Key Checks**: Ensures parent records exist (geoLocale for boxes, box for variables)
- ✅ **Type Validation**: Variable types must be valid (text, email, number, coordinates, nested)
- ✅ **Cascade Deletes**: Automatic cleanup of dependent records
- ✅ **Self-Referencing Prevention**: Variables cannot be their own parent
- ✅ **Clear Error Messages**:
  - `ConvexError("Unauthorized access")` - Wrong key
  - `ConvexError("Admin functionality not configured")` - Missing key
  - `ConvexError("GeoLocale not found")` - Invalid reference

#### Security Best Practices

❌ **Never** expose `ADMIN_SECRET_KEY` in client-side code
❌ **Never** hardcode the key in source files
✅ **Always** use environment variables
✅ **Always** call admin mutations from server-side code (Convex actions)

For complete API reference, see [convex/README.md](convex/README.md).

## Editing & Build Hygiene
- Avoid literal escape sequences (`\n`, `` `r`n ``); write real newlines.
- Save source files as UTF-8 without BOM (PowerShell: `Set-Content -Encoding UTF8`).
- Run `pnpm run typecheck` and `pnpm run build` locally before pushing structural changes.
- Run `npx convex dev` when Convex schema changes to push updates and regenerate types.
- If automating edits, prefer here-strings and keep docs (`README.md`, `agents.md`, `Claude.md`) in sync.


