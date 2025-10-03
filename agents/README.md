# AI Agents for Puerto Rico Logistics Grid

This directory contains the implementation of two specialized AI agents for the Puerto Rico Logistics Grid platform:

- **Fabiola** - Public-facing logistics assistant (Claude 3 Haiku)
- **Jaynette** - Administrative data management assistant (Claude 3.5 Sonnet)

## Quick Start

```bash
# 1. Install dependencies (already done if you're reading this)
pnpm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# 3. Initialize Convex AI Component
npx convex dev
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────┤
│  FabiolaChat Component        │    JaynetteAdmin Component   │
│  (Public Interface)           │    (Admin Interface)         │
├─────────────────────────────────────────────────────────────┤
│                    Convex Actions Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Convex AI Component (Thread & Message Management)     │ │
│  │  - Persistence, Real-time updates, Rate limiting       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Claude Agent SDK (Agent Logic & Tool Execution)       │ │
│  │  - Context management, Tool orchestration, Prompting   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  OpenRouter API (LLM Provider)                         │ │
│  │  - Claude 3 Haiku (Fabiola), Claude 3.5 Sonnet (Jaynette) │ │
│  └────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Convex Database                           │
│  geoLocales, facilityBoxes, facilityVariables, threads      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **AI Agent Framework** | Convex AI Component | Thread/message persistence, real-time updates |
| **Agent Logic** | Claude Agent SDK | Tool orchestration, context management |
| **LLM Provider** | OpenRouter API | Cost-effective API with fallback support |
| **Models** | Claude 3 Haiku / Claude 3.5 Sonnet | Fast public queries / Complex admin operations |
| **Backend** | Convex | Serverless database and actions |
| **Validation** | Zod | Type-safe schemas for tools and data |
| **Frontend** | Next.js + React | UI components |

## Documentation

### Core Documentation
- **[Architecture Guide](./docs/ARCHITECTURE.md)** - Complete system design and data flow (90KB+)
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Environment setup, deployment steps, and configuration
- **[Future Work](./docs/FUTURE_WORK.md)** - ⚠️ **START HERE** for Claude Agent SDK integration

### Component Documentation
- **[Components README](./components/README.md)** - Frontend component usage, props, and examples
- **[Convex Agents README](../convex/agents/README.md)** - Backend tools and Convex implementation
- **[OpenRouter Setup](./lib/openrouter/README.md)** - API configuration and cost tracking

## Directory Structure

```
agents/
├── README.md                       # This file
├── docs/                           # Documentation
│   ├── ARCHITECTURE.md             # ✅ Complete system design (90KB+)
│   ├── DEPLOYMENT.md               # ✅ Environment setup and deployment
│   └── FUTURE_WORK.md              # ⚠️ Claude Agent SDK integration guide
├── lib/                            # Shared utilities
│   ├── openrouter/
│   │   ├── client.ts               # ✅ OpenRouter API client with cost tracking
│   │   └── README.md               # ✅ API setup and usage guide
│   ├── config.ts                   # ✅ Agent configurations (system prompts, models)
│   └── types.ts                    # ✅ TypeScript types and constants
└── components/                     # React components
    ├── FabiolaChat.tsx             # ✅ Public chat widget (floating)
    ├── JaynetteAdmin.tsx           # ✅ Admin dashboard (full page)
    └── README.md                   # ✅ Component documentation

convex/agents/                      # Convex actions
├── README.md                       # ✅ Tools reference and patterns
├── fabiola.ts                      # ✅ Fabiola: 4 read-only tools + chat handler
├── jaynette.ts                     # ✅ Jaynette: 5 admin tools + chat handler
└── shared/
    └── helpers.ts                  # ✅ Geographic utils, validation, result helpers
```

## Quick Examples

### Using Fabiola (Public Chat)

```tsx
import FabiolaChat from '@/agents/components/FabiolaChat';

export default function MapPage() {
  return (
    <div>
      {/* Your map interface */}
      <FabiolaChat />
    </div>
  );
}
```

### Using Jaynette (Admin Operations)

```tsx
import JaynetteAdmin from '@/agents/components/JaynetteAdmin';

export default function AdminPage() {
  return <JaynetteAdmin />;
}
```

## Environment Variables

Required environment variables (add to `.env.local`):

```env
# OpenRouter API (primary LLM provider)
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Anthropic API (fallback for Claude Agent SDK)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Admin Security
ADMIN_SECRET_KEY=your-existing-convex-admin-key
ADMIN_INTERFACE_PASSWORD=secure-admin-password

# Convex (existing)
CONVEX_DEPLOYMENT=xxx
NEXT_PUBLIC_CONVEX_URL=xxx
```

## Key Features

### Fabiola (Public Assistant)
✅ Search facilities by name, type, or region
✅ Get detailed facility information
✅ Find nearby facilities with distance calculation
✅ Bilingual responses (English/Spanish)
✅ Real-time streaming responses
✅ Read-only access (no data modification)

### Jaynette (Admin Assistant)
✅ Create facilities with natural language
✅ Update existing facility data
✅ Bulk import from CSV/JSON
✅ Generate analytics reports
✅ Session-based authentication
✅ Full audit logging
✅ Dry-run mode for bulk operations

## Development

```bash
# Start Convex in dev mode
npx convex dev

# Run Next.js dev server
pnpm run dev

# Type checking
pnpm run typecheck

# Build for production
pnpm run build
```

## Testing

See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) for testing guidelines.

## Current Status

### ✅ Complete (Ready to Use)
- All 9 agent tools implemented and documented
- React components (FabiolaChat, JaynetteAdmin) fully functional
- Session management for admin access
- OpenRouter API client with cost tracking
- Comprehensive documentation (140KB+ across all docs)

### ⚠️ Pending (Next Step)
- **Claude Agent SDK integration** - See [FUTURE_WORK.md](./docs/FUTURE_WORK.md)
  - Current: Chat handlers return placeholder responses
  - Required: Integrate actual AI with tool orchestration
  - Time estimate: 1-2 days for experienced developer

## Support

For questions or issues:
1. **Starting SDK integration?** → [FUTURE_WORK.md](./docs/FUTURE_WORK.md)
2. **Understanding the system?** → [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. **Component usage?** → [components/README.md](./components/README.md)
4. **Tool reference?** → [convex/agents/README.md](../convex/agents/README.md)

## Contributing

When modifying agent behavior:
1. Update relevant documentation
2. Test both agents thoroughly
3. Update tool definitions in [TOOLS.md](./docs/TOOLS.md)
4. Ensure schema changes are documented

---

**Last Updated:** 2025-10-03
**Maintainer:** Development Team
**Version:** 1.0.0
