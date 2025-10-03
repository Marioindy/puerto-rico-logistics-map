# Agent Architecture Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Data Flow](#data-flow)
4. [Component Integration](#component-integration)
5. [Database Schema](#database-schema)
6. [Tool System](#tool-system)
7. [Security Model](#security-model)
8. [Scalability](#scalability)

---

## System Overview

The Puerto Rico Logistics Grid agent system combines three powerful technologies to create a production-ready AI assistant platform:

### Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                                │
│  ┌──────────────────┐           ┌──────────────────────┐        │
│  │  FabiolaChat     │           │  JaynetteAdmin       │        │
│  │  (Public UI)     │           │  (Admin UI)          │        │
│  └──────────────────┘           └──────────────────────┘        │
│         │                                    │                    │
│         └─────────────┬──────────────────────┘                    │
└────────────────────────│──────────────────────────────────────────┘
                         │
          ┌──────────────▼───────────────┐
          │   CONVEX ACTIONS LAYER       │
          │  ┌────────────────────────┐  │
          │  │ Convex AI Component    │  │
          │  │ - Thread Management    │  │
          │  │ - Message Persistence  │  │
          │  │ - Real-time Sync      │  │
          │  └────────────────────────┘  │
          │  ┌────────────────────────┐  │
          │  │ Claude Agent SDK       │  │
          │  │ - Tool Orchestration   │  │
          │  │ - Context Management   │  │
          │  │ - Agent Logic          │  │
          │  └────────────────────────┘  │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼───────────────┐
          │   LLM PROVIDER LAYER         │
          │  ┌────────────────────────┐  │
          │  │   OpenRouter API       │  │
          │  │  - Claude 3 Haiku      │  │
          │  │  - Claude 3.5 Sonnet   │  │
          │  └────────────────────────┘  │
          └──────────────┬───────────────┘
                         │
          ┌──────────────▼───────────────┐
          │     DATA LAYER                │
          │  ┌────────────────────────┐  │
          │  │   Convex Database      │  │
          │  │  - geoLocales          │  │
          │  │  - facilityBoxes       │  │
          │  │  - facilityVariables   │  │
          │  │  - threads             │  │
          │  │  - messages            │  │
          │  │  - adminSessions       │  │
          │  └────────────────────────┘  │
          └──────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Convex AI Component** | Provides automatic persistence, real-time updates, and handles thread management |
| **Claude Agent SDK** | Handles complex agent logic, tool orchestration, and context management |
| **OpenRouter API** | Cost-effective access to multiple LLM providers with automatic fallback |
| **Two Separate Agents** | Clear security boundaries, cost optimization, specialized capabilities |
| **Tool-based Architecture** | Flexible, extensible, and type-safe with Zod validation |

---

## Architecture Layers

### 1. Client Layer

**Components:**
- `FabiolaChat.tsx` - Floating chat widget for public users
- `JaynetteAdmin.tsx` - Admin dashboard for database management

**Responsibilities:**
- UI rendering and user interaction
- Real-time message display via Convex subscriptions
- Input validation and formatting
- Session management (Jaynette only)

**Technology:**
- React 19
- Convex React hooks (`useQuery`, `useAction`)
- TailwindCSS for styling
- React Markdown for message formatting

### 2. Action Layer (Convex)

**Location:** `convex/agents/`

**Components:**
- `fabiola.ts` - Public agent actions
- `jaynette.ts` - Admin agent actions

**Responsibilities:**
- Thread creation and management
- Message persistence
- Tool execution with Convex context
- Authentication and authorization (Jaynette)
- Audit logging

**Key Patterns:**

```typescript
// Thread creation
const { threadId } = await agent.createThread(ctx, {
  metadata: { userId }
});

// Message generation
const thread = agent.thread(ctx, { threadId });
const result = await thread.generateText({ prompt });
```

### 3. Agent Logic Layer (Claude Agent SDK)

**Components:**
- Agent configurations
- Tool definitions
- System prompts
- Permission management

**Responsibilities:**
- Agent behavior and personality
- Tool orchestration and execution
- Context window management
- Multi-step reasoning

**Configuration:**

```typescript
const fabiolaAgent = new Agent(components.agent, {
  name: "Fabiola",
  languageModel: openrouter("claude-3-haiku"),
  instructions: "System prompt...",
  tools: { ...tools },
  maxSteps: 5,
});
```

### 4. LLM Provider Layer (OpenRouter)

**Provider:** OpenRouter API

**Models:**
- **Fabiola:** `anthropic/claude-3-haiku` ($0.25/1M input tokens)
- **Jaynette:** `anthropic/claude-3.5-sonnet-20241022` ($3/1M input tokens)

**Features:**
- Automatic fallback to alternative providers
- Built-in rate limiting
- Usage tracking and cost monitoring
- Unified API for multiple models

### 5. Data Layer (Convex)

**Tables:**
- `geoLocales` - Facility locations
- `facilityBoxes` - UI organization for facilities
- `facilityVariables` - Dynamic facility attributes
- `threads` - Conversation threads (managed by Convex AI Component)
- `messages` - Individual messages (managed by Convex AI Component)
- `adminSessions` - Admin authentication sessions

---

## Data Flow

### Public User Flow (Fabiola)

```
1. User opens chat widget (FabiolaChat.tsx)
   ↓
2. Component creates new thread via createThread action
   ↓
3. User sends message
   ↓
4. FabiolaChat calls chat action with threadId and message
   ↓
5. Action retrieves thread history from Convex
   ↓
6. Agent processes message and determines if tools are needed
   ↓
7. If tools needed: Execute tools → Get results → Continue generation
   ↓
8. Agent generates response
   ↓
9. Response saved to thread in Convex database
   ↓
10. Real-time update pushes message to all subscribed clients
    ↓
11. User sees response in chat widget
```

### Admin User Flow (Jaynette)

```
1. Admin visits /admin and authenticates with password
   ↓
2. Server creates session token (4-hour expiry)
   ↓
3. Admin interface loads with JaynetteAdmin component
   ↓
4. Component creates admin thread
   ↓
5. Admin sends natural language command
   ↓
6. adminChat action validates session token
   ↓
7. Agent processes command and calls appropriate tools
   ↓
8. Tools execute with ADMIN_SECRET_KEY validation
   ↓
9. Database mutations performed (create/update/delete)
   ↓
10. Audit log entry created
    ↓
11. Response with confirmation returned to admin
```

### Tool Execution Flow

```
User Message → Agent Analysis
                    ↓
        ┌───────────┴───────────┐
        │                       │
    Tool Call 1             Tool Call 2
        │                       │
   ┌────▼────┐            ┌────▼────┐
   │  Tool   │            │  Tool   │
   │ Handler │            │ Handler │
   └────┬────┘            └────┬────┘
        │                       │
   Convex Query           Convex Mutation
        │                       │
   ┌────▼────┐            ┌────▼────┐
   │Database │            │Database │
   └────┬────┘            └────┬────┘
        │                       │
    Result 1               Result 2
        │                       │
        └───────────┬───────────┘
                    ↓
            Results Combined
                    ↓
            Agent Generates
            Final Response
```

---

## Component Integration

### Convex AI Component Integration

The Convex AI Component is installed via `convex.config.ts`:

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);
export default app;
```

After running `npx convex dev`, the component generates:
- `components.agent` - The agent component instance
- Type definitions in `_generated/`
- Table schemas for `threads` and `messages`

**Usage in actions:**

```typescript
import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";

const agent = new Agent(components.agent, {
  // configuration
});
```

### Claude Agent SDK Integration

The SDK provides:
- `createTool()` - Type-safe tool definitions
- Context management
- Multi-step reasoning
- Hooks for logging and monitoring

**Tool definition example:**

```typescript
import { createTool } from "@convex-dev/agent";
import { z } from "zod";

const searchFacilities = createTool({
  description: "Search for logistics facilities",
  args: z.object({
    search: z.string().optional(),
    type: z.enum(["warehouse", "port", "airport"]).optional(),
  }),
  handler: async (ctx, args) => {
    // ctx has access to Convex context
    const results = await ctx.runQuery(api.geoLocales.listWithDetails, args);
    return results;
  },
});
```

### OpenRouter Integration

OpenRouter acts as a unified API gateway:

```typescript
// agents/lib/openrouter/client.ts
import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
    'X-Title': 'Puerto Rico Logistics Grid',
  },
});
```

Used with Vercel AI SDK:

```typescript
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Pass to Agent
languageModel: openai("anthropic/claude-3-haiku")
```

---

## Database Schema

### Agent-Managed Tables

**threads**
```typescript
{
  userId: v.optional(v.string()),
  agentName: v.string(),              // "Fabiola" or "Jaynette"
  metadata: v.optional(v.any()),      // Custom context
  createdAt: v.number(),
  updatedAt: v.number(),
}
.index("by_user", ["userId"])
```

**messages**
```typescript
{
  threadId: v.id("threads"),
  role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
  content: v.string(),
  toolCalls: v.optional(v.array(v.any())),
  metadata: v.optional(v.any()),      // Tool results, session info
  createdAt: v.number(),
}
.index("by_thread", ["threadId"])
```

### Application Tables

**adminSessions**
```typescript
{
  token: v.string(),                  // Random session token
  userId: v.string(),                 // "admin"
  expiresAt: v.number(),              // 4 hours from creation
  createdAt: v.number(),
}
.index("by_token", ["token"])
```

**Existing tables:**
- `geoLocales` - Facility locations
- `facilityBoxes` - UI sections for facilities
- `facilityVariables` - Dynamic facility metadata

---

## Tool System

### Tool Architecture

Tools are the primary way agents interact with the database and external systems.

**Tool Components:**
1. **Description** - Natural language description for the LLM
2. **Args Schema** - Zod schema for type-safe inputs
3. **Handler** - Async function with Convex context

### Tool Context

Every tool handler receives:
- `ctx.agent` - The Agent instance
- `ctx.userId` - User ID (if available)
- `ctx.threadId` - Thread ID (if in thread context)
- `ctx.messageId` - Message ID of the prompt
- `ctx.runQuery()` - Execute Convex queries
- `ctx.runMutation()` - Execute Convex mutations
- `ctx.runAction()` - Execute Convex actions

### Tool Categories

**Fabiola Tools (Read-Only):**
- `search_facilities` - Search with filters
- `get_facility_details` - Retrieve complete facility data
- `get_nearby_facilities` - Geographic proximity search
- `get_statistics` - Analytics and summaries

**Jaynette Tools (Admin):**
- `create_facility` - Add new facilities
- `update_facility` - Modify existing data
- `delete_facility` - Remove facilities (cascading)
- `bulk_import` - Import multiple facilities
- `generate_report` - Create analytics reports

---

## Security Model

### Authentication Layers

**Public Access (Fabiola):**
- No authentication required
- Read-only database access
- Rate limiting per IP/session
- No PII exposure

**Admin Access (Jaynette):**
- Password authentication (ADMIN_INTERFACE_PASSWORD)
- Session tokens with 4-hour expiration
- ADMIN_SECRET_KEY validation on all mutations
- Full audit logging

### Permission Boundaries

```typescript
// Fabiola - Read-only tools
const searchFacilities = createTool({
  handler: async (ctx, args) => {
    // Can ONLY call runQuery
    return await ctx.runQuery(api.geoLocales.listWithDetails, args);
  },
});

// Jaynette - Admin tools
const createFacility = createTool({
  handler: async (ctx, args) => {
    const adminKey = process.env.ADMIN_SECRET_KEY!;
    // Must pass admin key to mutations
    return await ctx.runMutation(api.geoLocales.adminCreate, {
      adminKey,
      ...args,
    });
  },
});
```

### Data Validation

All tool inputs are validated with Zod schemas:

```typescript
args: z.object({
  coordinates: z.object({
    lat: z.number().min(17.5).max(18.6),     // Puerto Rico bounds
    lng: z.number().min(-67.5).max(-65.0),
  }),
})
```

---

## Scalability

### Horizontal Scaling

**Convex AI Component:**
- Automatically scales with Convex infrastructure
- Supports unlimited concurrent threads
- Real-time updates push to all connected clients

**OpenRouter:**
- Handles rate limiting and fallbacks
- Automatic load balancing across providers

### Performance Optimizations

**Message Streaming:**
```typescript
// Enable streaming for better UX
const result = await thread.streamText({
  prompt: message,
  onChunk: (chunk) => {
    // Update UI incrementally
  }
});
```

**Context Management:**
- Claude Agent SDK automatically manages context windows
- Older messages summarized when approaching limits
- Critical context preserved

**Caching:**
- Convex queries are cached automatically
- Real-time subscriptions minimize redundant fetches

### Cost Optimization

**Model Selection:**
- Fabiola: Claude 3 Haiku ($0.25/1M tokens) for simple queries
- Jaynette: Claude 3.5 Sonnet ($3/1M tokens) for complex operations

**Estimated Monthly Costs:**
- Fabiola: ~$50-100 (assuming 200M tokens/month)
- Jaynette: ~$20-40 (assuming 10M tokens/month)

---

## Monitoring and Debugging

### Built-in Monitoring

**Convex Dashboard:**
- View all threads and messages
- Monitor query/mutation performance
- Track database usage

**OpenRouter Dashboard:**
- Token usage by model
- Cost tracking
- Request latency

### Audit Logging

All Jaynette operations are logged:

```typescript
{
  sessionToken: string,
  action: string,          // Tool name
  args: object,            // Tool arguments
  result: "success" | "failure",
  timestamp: number,
}
```

### Error Handling

**Tool Errors:**
- Caught and returned to agent
- Agent can retry or ask for clarification
- User-friendly error messages

**Session Errors:**
- Invalid tokens return 401
- Expired sessions redirect to login
- Clear error messages

---

## Future Enhancements

Planned improvements:
- **Voice Interface** - Speech-to-text for both agents
- **Multi-language** - Full Spanish language support
- **Webhooks** - Integration with external systems
- **Analytics Dashboard** - Usage metrics and insights
- **Mobile SDK** - Native mobile app support

---

**Last Updated:** 2025-10-03
**Next Review:** 2025-11-01
