# Future Work - Claude Agent SDK Integration

**Date**: 2025-10-03
**Status**: Components and Tools Complete, SDK Integration Pending
**Priority**: High

---

## Current State

### ✅ What's Complete

1. **React Components** (100%)
   - `agents/components/FabiolaChat.tsx` - Floating chat widget for public users
   - `agents/components/JaynetteAdmin.tsx` - Admin dashboard interface
   - Both components fully functional with UI, state management, and Convex queries

2. **Backend Infrastructure** (100%)
   - All 9 tools implemented and documented:
     - **Fabiola**: 4 read-only tools (search, details, nearby, statistics)
     - **Jaynette**: 5 admin tools (create, update, delete, bulk import, reports)
   - Session management for Jaynette (password auth, token validation, expiration)
   - Shared utility functions (geographic calculations, validation, result formatting)

3. **Configuration** (100%)
   - Agent configurations with system prompts (`agents/lib/config.ts`)
   - OpenRouter API client with cost tracking (`agents/lib/openrouter/client.ts`)
   - Type definitions and constants (`agents/lib/types.ts`)
   - Environment variable template (`.env.example`)

4. **Documentation** (100%)
   - Main README (`agents/README.md`)
   - Architecture guide (`agents/docs/ARCHITECTURE.md`)
   - Deployment guide (`agents/docs/DEPLOYMENT.md`)
   - OpenRouter documentation (`agents/lib/openrouter/README.md`)
   - Convex agents README (`convex/agents/README.md`)

### ⚠️ What's Missing

**The chat handlers currently return placeholder responses instead of calling the actual AI.**

---

## The Gap: Chat Handler Integration

### Current Implementation (Placeholder)

**Location**: `convex/agents/fabiola.ts` (lines ~299-335)

```typescript
export const chat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Add user message to thread
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "user",
      content: args.message,
    });

    // Get thread history
    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    // ❌ TODO: Integrate with Claude Agent SDK
    // For now, return a placeholder response
    const response = "I'm Fabiola, your logistics assistant. I'm currently being set up to help you with facility searches and logistics information. Full AI integration coming soon!";

    // Save assistant response
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "assistant",
      content: response,
    });

    return {
      message: response,
      toolsUsed: [],
    };
  },
});
```

**The same pattern exists in**:
- `convex/agents/fabiola.ts` - `chat()` action
- `convex/agents/jaynette.ts` - `adminChat()` action

### Required Implementation (Full SDK Integration)

**What needs to happen**:

1. **Initialize Claude Agent** with OpenRouter + Vercel AI SDK
2. **Pass conversation history** to the agent
3. **Let Claude decide** which tools to use based on user input
4. **Execute tools automatically** through the SDK
5. **Return Claude's response** with tool usage tracking

**Example implementation**:

```typescript
import { Agent } from "@anthropic-ai/claude-agent-sdk";
import { createOpenAI } from "@ai-sdk/openai";
import { FABIOLA_CONFIG } from "@/agents/lib/config";
import { fabiolaTools } from "./fabiola";

export const chat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Add user message to thread
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "user",
      content: args.message,
    });

    // 2. Get full conversation history
    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    // 3. Initialize OpenRouter client (via Vercel AI SDK)
    const openai = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
      defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Puerto Rico Logistics Grid',
      },
    });

    // 4. Create Claude Agent with tools
    const agent = new Agent({
      languageModel: openai(FABIOLA_CONFIG.model), // "anthropic/claude-3-haiku"
      tools: fabiolaTools, // All 4 tools: search_facilities, get_facility_details, etc.
      systemPrompt: FABIOLA_CONFIG.systemPrompt,
      maxSteps: FABIOLA_CONFIG.maxSteps, // Max tool calls per conversation turn
      temperature: FABIOLA_CONFIG.temperature,
    });

    // 5. Let Claude process message and use tools intelligently
    const result = await agent.generateText({
      messages: messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    // 6. Save Claude's response to thread
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "assistant",
      content: result.text,
    });

    // 7. Return response with metadata
    return {
      message: result.text,
      toolsUsed: result.toolCalls?.map(tc => tc.toolName) || [],
      usage: {
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
      },
    };
  },
});
```

**Do the same for Jaynette**: Update `convex/agents/jaynette.ts` → `adminChat()` action with similar logic, but use `JAYNETTE_CONFIG` and `jaynetteTools`.

---

## Implementation Checklist

### Step 1: Verify Convex AI Component API

The current code assumes the Convex AI Component has these functions:
- `api.agent.threads.create()`
- `api.agent.threads.addMessage()`
- `api.agent.threads.getMessages()`

**Action Items**:
- [ ] Check Convex AI Component documentation at `@convex-dev/agent`
- [ ] Verify the correct API for thread/message management
- [ ] Adjust function calls if the API differs from our assumptions
- [ ] Consider if we need custom tables for threads/messages instead

### Step 2: Integrate Claude Agent SDK

**Files to modify**:
1. `convex/agents/fabiola.ts` - Update `chat()` action
2. `convex/agents/jaynette.ts` - Update `adminChat()` action

**Required imports**:
```typescript
import { Agent } from "@anthropic-ai/claude-agent-sdk";
import { createOpenAI } from "@ai-sdk/openai";
import { FABIOLA_CONFIG } from "@/agents/lib/config";
```

**Key considerations**:
- **Tool format**: Ensure `fabiolaTools` and `jaynetteTools` match the SDK's expected format
- **Context management**: Claude has a 200K token context window (Haiku) or 200K (Sonnet) - manage conversation length
- **Error handling**: Wrap SDK calls in try-catch, return user-friendly errors
- **Streaming**: Consider using `agent.streamText()` for real-time responses (optional enhancement)

### Step 3: Test Tool Execution

Once integrated, test each tool:

**Fabiola Tools**:
- [ ] `search_facilities` - "Show me all warehouses in the north region"
- [ ] `get_facility_details` - "Tell me more about [facility name]"
- [ ] `get_nearby_facilities` - "What facilities are near San Juan?"
- [ ] `get_statistics` - "How many ports are in the system?"

**Jaynette Tools**:
- [ ] `create_facility` - "Create a new warehouse at coordinates 18.4, -66.0"
- [ ] `update_facility` - "Update the description for facility [ID]"
- [ ] `delete_facility` - "Delete facility [ID]"
- [ ] `bulk_import` - "Run a dry-run bulk import with [data]"
- [ ] `generate_report` - "Generate a summary report of all facilities"

### Step 4: Environment Setup

Ensure all required environment variables are set:

```bash
# Required for AI
OPENROUTER_API_KEY=sk-or-v1-...
ADMIN_SECRET_KEY=your-secure-key
ADMIN_INTERFACE_PASSWORD=your-password

# Required for Convex
CONVEX_DEPLOYMENT=prod:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Optional fallback
ANTHROPIC_API_KEY=sk-ant-api03-...

# Site URL for OpenRouter headers
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

**Get API keys**:
- OpenRouter: https://openrouter.ai/keys
- Anthropic (fallback): https://console.anthropic.com/settings/keys

### Step 5: Deploy and Monitor

**Deployment steps**:
1. Set environment variables in Convex dashboard
2. Deploy Convex functions: `npx convex deploy`
3. Deploy Next.js app: `vercel deploy` or AWS Amplify
4. Test in production

**Monitoring**:
- OpenRouter dashboard: https://openrouter.ai/activity
- Check token usage and costs
- Monitor error rates in Convex logs
- Set up budget alerts in OpenRouter

---

## Technical Details for Context

### How the SDK Integration Works

The Claude Agent SDK follows an **agentic workflow**:

1. **User sends message** → "Find warehouses near San Juan"
2. **Claude receives message** → Analyzes intent
3. **Claude decides tools** → "I need `get_nearby_facilities` tool"
4. **SDK executes tool** → Calls `getNearbyFacilitiesTool.handler()`
5. **Tool returns data** → `{ facilities: [...], total: 5 }`
6. **Claude synthesizes response** → "I found 5 warehouses near San Juan: ..."
7. **Response sent to user** → Natural language with data

**This all happens automatically** - you don't manually route tool calls. The SDK handles the tool orchestration loop.

### Why We Built It This Way

**Modularity**:
- Tools in `convex/agents/` (backend, secure, type-safe)
- Components in `agents/components/` (frontend, reusable)
- Config in `agents/lib/` (centralized, easy to modify)
- Each layer is independent and testable

**Security**:
- Fabiola: Read-only tools, no authentication required
- Jaynette: All tools validate `ADMIN_SECRET_KEY` + session tokens
- No direct database access from frontend

**Cost Optimization**:
- Fabiola: Claude 3 Haiku ($0.25/$1.25 per 1M tokens) - fast, cheap
- Jaynette: Claude 3.5 Sonnet ($3/$15 per 1M tokens) - powerful, precise
- Right model for the right job

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌─────────────────┐              ┌────────────────────┐   │
│  │  FabiolaChat    │              │  JaynetteAdmin     │   │
│  │  (Public)       │              │  (Admin)           │   │
│  └────────┬────────┘              └─────────┬──────────┘   │
│           │                                  │              │
└───────────┼──────────────────────────────────┼──────────────┘
            │                                  │
            │ Convex Queries/Mutations         │
            ▼                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend                            │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  fabiola.ts          │      │  jaynette.ts         │    │
│  │  - createThread()    │      │  - createThread()    │    │
│  │  - chat()            │      │  - adminChat()       │    │
│  │  - getThreadMessages│      │  - getThreadMessages│    │
│  └──────────┬───────────┘      └──────────┬───────────┘    │
│             │                             │                 │
│             │ Uses tools                  │ Uses tools      │
│             ▼                             ▼                 │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │  fabiolaTools        │      │  jaynetteTools       │    │
│  │  - search_facilities │      │  - create_facility   │    │
│  │  - get_details       │      │  - update_facility   │    │
│  │  - get_nearby        │      │  - delete_facility   │    │
│  │  - get_statistics    │      │  - bulk_import       │    │
│  │                      │      │  - generate_report   │    │
│  └──────────┬───────────┘      └──────────┬───────────┘    │
│             │                             │                 │
└─────────────┼─────────────────────────────┼─────────────────┘
              │                             │
              │ Query Convex DB             │ Mutate Convex DB
              ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Convex Database                         │
│  - geoLocales (facilities)                                   │
│  - facilityBoxes (UI sections)                               │
│  - facilityVariables (dynamic attributes)                    │
│  - adminSessions (auth tokens)                               │
│  - [agent threads/messages from AI Component]                │
└─────────────────────────────────────────────────────────────┘
```

---

## Expected Behavior After Integration

### Fabiola (Public Chat)

**User**: "Show me all warehouses in the north"

**Claude's Process**:
1. Analyzes intent → needs facility search
2. Calls `search_facilities` tool with `{ type: "warehouse", region: "north" }`
3. Receives result → `{ facilities: [...], total: 12 }`
4. Synthesizes response → "I found 12 warehouses in the northern region..."

**User sees**: Natural language response with facility details

### Jaynette (Admin Interface)

**Admin**: "Create a warehouse called 'Central Distribution' at coordinates 18.4, -66.0"

**Claude's Process**:
1. Analyzes intent → needs facility creation
2. Validates admin has session token ✓
3. Calls `create_facility` tool with validated parameters
4. Receives result → `{ success: true, facilityId: "j123..." }`
5. Synthesizes response → "I've successfully created the warehouse 'Central Distribution' with ID j123..."

**Admin sees**: Confirmation message with facility ID

---

## Cost Estimates (After Integration)

Based on typical usage patterns:

### Fabiola (Public)
- **Model**: Claude 3 Haiku
- **Cost**: $0.25 input / $1.25 output per 1M tokens
- **Average query**: ~2,000 input + 500 output tokens
- **Cost per query**: ~$0.0011
- **50k queries/month**: ~$55/month

### Jaynette (Admin)
- **Model**: Claude 3.5 Sonnet
- **Cost**: $3 input / $15 output per 1M tokens
- **Average operation**: ~3,000 input + 800 output tokens
- **Cost per operation**: ~$0.021
- **2k operations/month**: ~$42/month

**Total estimated cost**: $100-150/month for full deployment

**Cost optimization tips**:
- Limit conversation history (keep last 10 messages)
- Cache common queries in Convex
- Use Haiku for simple, Sonnet only when needed
- Monitor OpenRouter dashboard regularly

---

## Common Issues and Solutions

### Issue 1: "Agent not using tools"

**Symptom**: Claude responds but never calls any tools

**Causes**:
- Tool descriptions not clear enough
- Tool format doesn't match SDK expectations
- System prompt doesn't encourage tool use

**Solution**:
- Add examples to system prompt: "When users ask about facilities, use the search_facilities tool"
- Ensure tool descriptions are in natural language
- Check SDK docs for correct tool format

### Issue 2: "Invalid tool arguments"

**Symptom**: Tool executes but Zod validation fails

**Causes**:
- Claude passes wrong types (string instead of number)
- Missing required fields
- Values outside valid ranges

**Solution**:
- Add clear constraints in tool descriptions: "lat must be between 17.5 and 18.6"
- Use Zod `.coerce()` for flexible type conversion
- Add detailed error messages in validation

### Issue 3: "High API costs"

**Symptom**: OpenRouter bill higher than expected

**Causes**:
- Sending full conversation history every time
- Using Sonnet when Haiku would suffice
- Not limiting context window

**Solution**:
- Implement conversation summarization after 10 messages
- Cache frequently asked queries
- Set `maxTokens` limit in agent config
- Monitor usage in OpenRouter dashboard

### Issue 4: "Session expired" (Jaynette)

**Symptom**: Admin gets logged out during conversation

**Causes**:
- 4-hour session timeout
- Session token not being refreshed

**Solution**:
- Implement session extension on activity: Call `api.adminSessions.extendSession()` every 30 minutes
- Show countdown timer in UI
- Auto-refresh token before expiration
- Gracefully handle expired sessions with re-auth prompt

---

## Testing Strategy

### Unit Tests (Recommended)

Test each tool independently:

```typescript
// Example: Test search_facilities tool
import { searchFacilitiesTool } from "@/convex/agents/fabiola";

describe("searchFacilitiesTool", () => {
  it("should find warehouses in north region", async () => {
    const mockCtx = createMockContext();
    const result = await searchFacilitiesTool.handler(mockCtx, {
      type: "warehouse",
      region: "north",
      activeOnly: true,
    });

    expect(result.success).toBe(true);
    expect(result.data.facilities).toHaveLength(greaterThan(0));
  });

  it("should handle empty results gracefully", async () => {
    const mockCtx = createMockContext();
    const result = await searchFacilitiesTool.handler(mockCtx, {
      search: "NonexistentFacility12345",
    });

    expect(result.success).toBe(true);
    expect(result.data.facilities).toHaveLength(0);
  });
});
```

### Integration Tests

Test full chat flow:

1. Create thread
2. Send message
3. Verify tool was called
4. Verify response includes tool results
5. Check conversation history

### Manual Testing Checklist

**Fabiola**:
- [ ] Chat widget opens/closes properly
- [ ] Quick actions trigger correct queries
- [ ] Search results display correctly
- [ ] Facility details show all data
- [ ] Nearby search works with coordinates
- [ ] Statistics are accurate
- [ ] Bilingual responses work (English/Spanish)
- [ ] Error messages are user-friendly

**Jaynette**:
- [ ] Login works with correct password
- [ ] Login fails with wrong password
- [ ] Session persists across page refreshes
- [ ] Session expires after 4 hours
- [ ] Create facility validates coordinates
- [ ] Update facility prevents duplicates
- [ ] Delete facility cascades correctly
- [ ] Bulk import dry-run doesn't modify database
- [ ] Reports generate accurate data
- [ ] Logout clears session properly

---

## Performance Considerations

### Response Time Targets

- **Fabiola**: < 3 seconds for simple queries
- **Jaynette**: < 5 seconds for complex operations

**If slower**:
- Check OpenRouter status
- Reduce conversation history length
- Optimize Convex queries (add indexes)
- Consider switching to Haiku for Jaynette simple operations

### Scalability

**Current limits**:
- OpenRouter free tier: 20 requests/minute
- OpenRouter paid tier: 3,600 requests/minute
- Convex: Scales automatically

**For high traffic**:
- Implement request queuing
- Add rate limiting per user
- Cache common queries
- Consider dedicated Anthropic API for higher limits

---

## Team Handoff Notes

### Who Should Work on This

**Backend Developer**:
- Implement SDK integration in chat handlers
- Verify Convex AI Component API
- Handle error cases and edge conditions

**Frontend Developer** (minimal work needed):
- Components are complete, may need minor UI tweaks
- Add loading states if streaming is implemented
- Implement session refresh for Jaynette

**DevOps/Deployment**:
- Set environment variables in production
- Configure monitoring and alerts
- Set up OpenRouter budget limits

### Time Estimate

- **SDK Integration**: 4-6 hours
- **Testing**: 4-6 hours
- **Documentation updates**: 1-2 hours
- **Deployment**: 1-2 hours

**Total**: ~1-2 days for experienced developer

### Dependencies

- All NPM packages already installed ✓
- OpenRouter account needed (free to start)
- Convex deployment configured ✓
- Environment variables documented in `.env.example` ✓

### Questions to Answer Before Starting

1. **Convex AI Component API**: Does it match our assumptions? Check docs at `node_modules/@convex-dev/agent/README.md`
2. **Tool Format**: Does `createTool()` output match Claude Agent SDK expectations?
3. **Streaming**: Do we want real-time streaming responses or batch responses?
4. **Error Handling**: What should happen if OpenRouter API fails? Fallback to Anthropic direct?
5. **Session Management**: Should we implement automatic session extension for Jaynette?

---

## Success Criteria

**Integration is complete when**:

✅ User can chat with Fabiola and receive AI-generated responses
✅ Fabiola automatically uses tools based on user queries
✅ Admin can authenticate and chat with Jaynette
✅ Jaynette can create/update/delete facilities via natural language
✅ All tools execute without errors
✅ Responses include accurate data from database
✅ Error messages are user-friendly
✅ Token usage is tracked and within budget
✅ No placeholder responses remain in code

---

## References

- **Claude Agent SDK**: https://github.com/anthropics/claude-agent-sdk
- **Convex AI Component**: `node_modules/@convex-dev/agent/`
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Vercel AI SDK**: https://sdk.vercel.ai/docs
- **Project Architecture**: `agents/docs/ARCHITECTURE.md`
- **Tool Reference**: `convex/agents/README.md`

---

**Last Updated**: 2025-10-03
**Next Review**: After SDK integration is complete
**Contact**: Development Team

---

## Quick Start for Next Developer

```bash
# 1. Set up environment
cp .env.example .env.local
# Edit .env.local with your API keys

# 2. Start Convex
npx convex dev

# 3. Open fabiola.ts chat handler
code convex/agents/fabiola.ts

# 4. Replace placeholder with SDK integration (see example above)

# 5. Test locally
npm run dev

# 6. Open chat widget
http://localhost:3000/rfimap

# 7. Deploy when ready
npx convex deploy
vercel deploy
```

Good luck! 🚀
