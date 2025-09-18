# Claude Code Configuration

This file provides Claude Code with project-specific context and commands for the Puerto Rico Logistics Grid.

## Project Commands

### Development
- `npm run dev` - Start development server
- `npx convex dev` - Start Convex backend (run in separate terminal)

### Testing & Quality
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm run build` - Build production bundle

### Convex Backend
- `npx convex dev` - Start Convex development server
- `npx convex deploy` - Deploy to production
- Schema changes auto-regenerate `convex/_generated/` when running `npx convex dev`

## Key Technologies
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Convex (serverless backend)
- **Maps**: Google Maps JavaScript API
- **State**: React hooks, Convex queries/mutations

## Path Aliases
Use these TypeScript path aliases instead of relative imports:
- `@/app/*` → `./app/*`
- `@/components/*` → `./components/*`
- `@/lib/*` → `./lib/*`
- `@/types/*` → `./types/*`

## Architecture Guidelines

### Component Structure
- Keep components in `components/` for reusability
- Co-locate single-use components with their routes in `app/`
- Prefer client components (`"use client"`) for interactive UI
- Use server components for data fetching when possible

### Backend Development
- Define schemas in `convex/schema.ts`
- Add validators in `convex/validators.ts` 
- Organize functions by domain in `convex/functions/`
- Never edit `convex/_generated/` manually

### State Management
- Use Convex queries for server state
- Use React hooks for local state
- User context available via `lib/useUser.ts` (placeholder)

## Environment Setup
- Copy `.env.local.example` to `.env.local`
- Add new environment variables to both files
- Never commit real secrets to Git

## Testing Strategy
- Run `npm run lint` and `npm run typecheck` before commits
- CI runs these checks automatically on PRs
- Manual testing via development server

## Common Patterns

### Adding New Routes
1. Create route in `app/` following App Router conventions
2. Use `(dashboard)` route group for authenticated areas
3. Update navigation in `types/navigation.ts` if needed

### Adding Backend Functionality
1. Define data model in `convex/schema.ts`
2. Create validators in `convex/validators.ts`
3. Implement functions in `convex/functions/domain/`
4. Import and use in frontend components

### Styling
- Use Tailwind CSS classes
- Global styles in `styles/globals.css`
- CSS variables for theme consistency

## Debugging
- Use browser dev tools for frontend debugging
- Check Convex dashboard for backend logs
- Network tab for API call inspection
- Console for client-side errors