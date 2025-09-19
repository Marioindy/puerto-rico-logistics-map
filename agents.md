# Repository Agents Guide

This primer gives every contributor (human or automated) the shared map of where code lives, what belongs in each folder, and the guardrails to follow when expanding the Puerto Rico Logistics Grid.

## Guiding Principles
- Keep frontend UI (Next.js App Router) separate from backend logic (Convex) and shared utilities.
- Prefer TypeScript with the provided path aliases (`@/...`) to avoid brittle relative imports.
- Treat generated code and environment templates as source of truth—never modify generated files by hand and keep secrets out of Git.
- Update CI (`.github/workflows`) and docs (`README.md`, `agents.md`) whenever you introduce new build steps or structural changes.

## Directory Reference

### `app/`
Next.js App Router entry point.
- `layout.tsx`: Global shell (fonts, header, footer, gradient background).
- `page.tsx`: Landing page describing the stack and linking to dashboards.
- `(dashboard)/`: Route group that organizes operational workspaces.
  - `layout.tsx`: Dashboard chrome with side navigation.
  - `tracking/`: Primary dashboard workspace stub (`page.tsx`).
- Add new routes or nested layouts here; keep co-located components minimal and promote reusable pieces into `components/`.

### `components/`
Reusable React client components.
- `Header.tsx`: Site-wide top navigation bar driven by `types/navigation`.
- `MapView.tsx`: Google Maps wrapper responsible for SDK loading and fallback states.
- House shared UI atoms/organisms that appear in multiple routes; keep them presentation-focused and hook-free when possible.

### `convex/`
Convex backend source.
- `schema.ts`: Current Convex data model (seeded with `facilities` and `shipments` tables).
- `validators.ts`: Shared `v` validators for request/input schemas.
- `functions/`: Organize Convex queries/mutations by domain (e.g., `logistics/tracking.ts`).
- `_generated/`: Convex CLI output; do **not** edit manually.
- Expand here with new tables, cron jobs, or auth hooks, ensuring you regenerate with `npx convex dev` when schemas change.

### `lib/`
Shared utilities and hooks.
- `apiHelpers.ts`: Lightweight fetch wrapper for REST/Convex calls.
- `useUser.ts`: Placeholder user context hook; swap with real Convex/Amplify auth when ready.
- Add domain-agnostic helpers (formatters, caching, SDK clients) that multiple components consume.

### `styles/`
Global stylesheet and Tailwind configuration touchpoints.
- `globals.css`: Tailwind v4 `@import`, CSS variables, and base resets.
- Theme extensions or additional global styles belong here; component-scoped styles should stay inline or use CSS Modules colocated with the component.

### `types/`
Centralized TypeScript definitions.
- `navigation.ts`: Navigation item contract shared by layout/header components.
- Introduce additional app-wide interfaces here (API payloads, Convex data shapes) when they are reused across modules.

### `public/`
Static assets served as-is by Next.js.
- Default Next.js SVGs remain as placeholders; drop logos, favicons, manifest, and other static files here.
- Large media should be stored in CDN/object storage—reference URLs here instead of committing them.

### `.github/`
Continuous integration and automation.
- `workflows/ci.yml`: Runs lint (`npm run lint`) and type checks (`npm run typecheck`) on pushes/PRs.
- Add additional workflows (tests, deployments) alongside `ci.yml` as automation matures.

### Root Files & Metadata
- `.env.local` (git-ignored) & `.env.local.example`: Runtime secrets; always add new required variables to the example file.
- `.gitignore`: Includes a rule to allow `.env*.example` files while blocking real secrets.
- `package.json`: Scripts (`dev`, `build`, `lint`, `typecheck`) and dependencies; bump versions and scripts here.
- `tsconfig.json`: Compiler settings + path aliases (`@/app/*`, `@/components/*`, etc.).
- `README.md`: High-level project overview and onboarding steps.
- `postcss.config.mjs`, `eslint.config.mjs`, `next.config.ts`: Tooling configuration—update when adjusting build or lint behaviour.
- `node_modules/`: Dependency install output (ignored by Git).
- `pr-logistics-map/`: Legacy or reference project snapshot—leave untouched unless migrating assets intentionally.

## Contribution Checklist
- Add or update TypeScript types when introducing new data contracts.
- Ensure new Convex schema changes regenerate `_generated` artifacts.
- Keep CI green by updating `.github/workflows` if new scripts or test suites are required.
- Reflect structural changes here (`agents.md`) and in `README.md` for future collaborators.

---
Maintaining this map keeps every agent aligned—update it as the architecture evolves.

## Chat Assistant (Perplexity)
- Server route: `app/api/chat/route.ts` — only place that calls Perplexity. Reads `process.env.PPLX`.
- UI component: `components/ChatbotFab.tsx` — floating button and panel, currently mounted only on RFI map (`app/tracking/page.tsx`).
- Env vars: add `PPLX` in deployment environment. Never add a `NEXT_PUBLIC_` prefix for secrets.
- Testing: you can stub the route by returning a canned payload while developing without an API key.
## Build Pitfalls and How to Avoid Them

These failures have recurred during edits on Windows/PowerShell and cause Next/SWC to crash in CI:

- “Expected unicode escape” near an import line
  - Cause: a literal `\n` or `` `r`n `` sequence was inserted into source (e.g., `import X;\nimport Y`). SWC expects a real newline, not the characters backslash+n.
  - Avoid: when patching via scripts, use here-strings and never embed escape sequences. Prefer your editor or Git patches. If you must script, write files with Set-Content -Encoding UTF8 and construct strings with actual newlines.
  - Quick fix: replace literal `\n` with a real newline.
    - PowerShell: `$c=(Get-Content file -Raw); $c=$c -replace "\\n","`r`n"; Set-Content file -Value $c -Encoding UTF8`

- “Expression expected” at `</section><section ...>`
  - Cause: missing closing tags or two JSX nodes jammed together on one line.
  - Avoid: keep JSX blocks formatted with line breaks; don’t concatenate closing and opening tags in replacements.
  - Quick fix: separate into `</section>\n\n<section ...>` and ensure wrapper divs are properly closed.

- “stream did not contain valid UTF-8”
  - Cause: file saved with non-UTF8 encoding after shell edits or copy/paste from Word/Outlook.
  - Avoid: always save `.ts/.tsx/.css` as UTF-8 (no BOM). In PowerShell, use `-Encoding UTF8`.
  - Quick fix: re-encode: `Set-Content path -Value (Get-Content path -Raw) -Encoding UTF8`.

Recommended hygiene
- Prefer editor commits over shell text surgery; if scripting, use here-strings:
  - `@'\n...verbatim content...\n'@ | Set-Content file -Encoding UTF8`
- Run a quick scan before pushing:
  - `rg -n "\\n|`r`n" app/**/*.tsx components/**/*.tsx` (find literal escapes)
  - `npm run typecheck && npm run build`
- Consider `.gitattributes` to enforce UTF-8 + LF for source files to reduce OS-specific issues.
