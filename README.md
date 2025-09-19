

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
  (dashboard)/
    layout.tsx
    tracking/
      page.tsx
  layout.tsx
  page.tsx
components/
  Header.tsx
  MapView.tsx
convex/
  functions/
    logistics/
      tracking.ts
  index.ts
  schema.ts
  validators.ts
lib/
  apiHelpers.ts
  useUser.ts
types/
  navigation.ts
styles/
  globals.css
.env.local.example
```

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
- Amplify Hosting: add the same variables in “Environment variables”. Do not prefix `PPLX` with `NEXT_PUBLIC_`.

