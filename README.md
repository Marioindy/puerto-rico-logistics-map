# Puerto Rico Logistics Grid

Foundational scaffolding for a Next.js App Router workspace wired to Convex, Amplify, Google Maps, Tailwind, and TypeScript. The code is intentionally light so teams can plug in agency-specific flows without reworking the structure.

## Stack Outline
- Next.js App Router for layouts, routing, and streaming dashboards
- Convex for data, auth, and realtime API functions
- AWS Amplify for partner integrations and delivery channels
- Google Maps for geospatial overlays
- Tailwind CSS v4 for design tokens and rapid UI work
- TypeScript for shared types end-to-end

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
  api/
    chat/route.ts        # Perplexity proxy
  layout.tsx             # Global shell (imports env validation)
  page.tsx               # Root route re-export (points to homepage/page)
components/
  ChatbotFab.tsx         # Shared assistant FAB
  Header.tsx             # Global header
  InteractiveMap.tsx     # Full map surface (RFI)
  MapView.tsx            # Landing preview map
content/
  home.ts                # Typed content-as-code for landing page
lib/
  content/
    loaders.ts           # Fetch + validate Home content
    schema.ts            # Zod schemas for Home content
  env/
    index.ts             # Validates env vars at build/runtime
    schema.ts            # Zod env schemas
  facilityData.ts        # RFI map markers and helpers
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
Shared UI belongs in `components/`. Do not add placeholders—only commit folders/files once they contain real code.

## Getting Started
1. Copy `.env.local.example` to `.env.local` and fill in real credentials.
2. Install packages: `npm install` (or `pnpm install`).
3. Run the dev server: `npm run dev` and open `http://localhost:3000`.

Convex and Amplify are not fully configured yet; follow their respective docs when you are ready to wire in real backends.

## Assistant (Perplexity)
- API route: `app/api/chat/route.ts` proxies to Perplexity using the secret `PPLX`.
- Client: `components/ChatbotFab.tsx` renders a floating button and a chat panel on the RFI Map page.
- Security: The browser never receives `PPLX`; requests go through the server route.

### Configure environment variables
- Local: copy `.env.local.example` to `.env.local` and set:
  - `PPLX` — Perplexity API key (server-only)
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Google Maps key (client)
- Amplify Hosting: add the same variables in "Environment variables". Do not prefix `PPLX` with `NEXT_PUBLIC_`.
