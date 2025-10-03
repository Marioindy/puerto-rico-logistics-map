# Quick Start - Completing the AI Agent Integration

**For the developer who picks this up next** 👋

This is a 5-minute guide to understand what's done and what's left.

---

## TL;DR

✅ **What's done**: All 9 agent tools, React components, documentation (140KB+)
⚠️ **What's left**: Replace placeholder responses with actual Claude AI (1-2 days)

**Current behavior**: Chat works but returns "I'm being set up..." messages
**Target behavior**: Chat uses Claude to intelligently call tools and respond

---

## See It Working (Right Now)

```bash
# 1. Start the dev server
npm run dev  # or pnpm run dev

# 2. Open the map page
http://localhost:3000/rfimap

# 3. Click the blue chat button (bottom-right)
# You'll see Fabiola's chat widget open

# 4. Try sending a message
# You'll get a placeholder response (not AI yet)
```

**That's the foundation!** Everything works except the AI integration.

---

## The One Thing You Need to Do

**Replace placeholder responses in 2 files**:

1. `convex/agents/fabiola.ts` (line ~321)
2. `convex/agents/jaynette.ts` (line ~522)

**Current code** (placeholder):
```typescript
const response = "I'm Fabiola, your logistics assistant. I'm currently being set up...";
```

**Target code** (actual AI):
```typescript
import { Agent } from "@anthropic-ai/claude-agent-sdk";
import { createOpenAI } from "@ai-sdk/openai";

// Initialize agent with tools
const agent = new Agent({
  languageModel: openai(FABIOLA_CONFIG.model),
  tools: fabiolaTools, // All 4 tools ready to use
  systemPrompt: FABIOLA_CONFIG.systemPrompt,
});

// Let Claude decide which tools to use
const result = await agent.generateText({
  messages: messages, // Full conversation history
});

const response = result.text; // Real AI response
```

**That's it!** The tools are built, the components work, just wire them up.

---

## Step-by-Step Integration (1 hour)

### Step 1: Check Convex AI Component API (10 min)

Open: `node_modules/@convex-dev/agent/README.md`

**Verify these functions exist**:
- `api.agent.threads.create()`
- `api.agent.threads.addMessage()`
- `api.agent.threads.getMessages()`

If they're different, update the calls in:
- `convex/agents/fabiola.ts` (lines 277, 306, 313)
- `convex/agents/jaynette.ts` (lines 467, 507, 514)

### Step 2: Set Up Environment (5 min)

```bash
# Copy template
cp .env.example .env.local

# Get OpenRouter API key (free tier available)
# Visit: https://openrouter.ai/keys

# Add to .env.local:
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3: Integrate SDK in Fabiola (20 min)

**File**: `convex/agents/fabiola.ts`

**Find this** (line ~305):
```typescript
export const chat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // ... existing code ...

    // TODO: Integrate with Claude Agent SDK
    const response = "I'm Fabiola, your logistics assistant...";

    // ... rest of code ...
  },
});
```

**Replace with** (see `agents/docs/FUTURE_WORK.md` lines 50-100 for full code):
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
    // Add user message
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "user",
      content: args.message,
    });

    // Get conversation history
    const messages = await ctx.runQuery(api.agent.threads.getMessages, {
      threadId: args.threadId,
    });

    // Initialize OpenRouter client
    const openai = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY!,
    });

    // Create agent with tools
    const agent = new Agent({
      languageModel: openai(FABIOLA_CONFIG.model),
      tools: fabiolaTools, // 4 read-only tools
      systemPrompt: FABIOLA_CONFIG.systemPrompt,
      maxSteps: 5,
    });

    // Let Claude use tools and respond
    const result = await agent.generateText({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    });

    // Save response
    await ctx.runMutation(api.agent.threads.addMessage, {
      threadId: args.threadId,
      role: "assistant",
      content: result.text,
    });

    return {
      message: result.text,
      toolsUsed: result.toolCalls?.map(tc => tc.toolName) || [],
    };
  },
});
```

### Step 4: Integrate SDK in Jaynette (20 min)

**File**: `convex/agents/jaynette.ts`

Do the same thing but use:
- `JAYNETTE_CONFIG` instead of `FABIOLA_CONFIG`
- `jaynetteTools` instead of `fabiolaTools`
- Keep the session validation at the start

### Step 5: Test (10 min)

```bash
# Start Convex
npx convex dev

# Start Next.js
npm run dev

# Open chat
http://localhost:3000/rfimap

# Test queries:
# - "Show me all warehouses"
# - "Find facilities near San Juan"
# - "How many ports are there?"
```

**Look for**:
- Real responses (not placeholder)
- Tool calls in Convex logs
- Accurate data in responses

---

## Common Issues

### "Agent is not defined"

**Cause**: Import missing
**Fix**: Add at top of file:
```typescript
import { Agent } from "@anthropic-ai/claude-agent-sdk";
```

### "OPENROUTER_API_KEY is not defined"

**Cause**: Environment variable missing
**Fix**: Check `.env.local` has the key, restart `npx convex dev`

### "Tool format is incorrect"

**Cause**: Tools don't match SDK expectations
**Fix**: Check Claude Agent SDK docs for correct tool format

### "Type errors on result.text"

**Cause**: SDK return type different than expected
**Fix**: Check SDK docs for correct response structure

---

## Testing Checklist

After integration, test these queries:

**Fabiola**:
- [ ] "Show me warehouses in the north"
- [ ] "Tell me about [facility name]"
- [ ] "What facilities are near coordinates 18.4, -66.0?"
- [ ] "How many airports are there?"

**Jaynette** (after creating admin route):
- [ ] "Create a warehouse at 18.4, -66.0 called Test Warehouse"
- [ ] "Update facility [ID] description to 'Updated description'"
- [ ] "Generate a summary report"

**Look for**:
- Tools execute automatically
- Responses include actual facility data
- No errors in console
- Natural language responses

---

## Resources

**Must read**:
- `agents/docs/FUTURE_WORK.md` - Complete integration guide with examples

**Also helpful**:
- `agents/docs/ARCHITECTURE.md` - System overview
- `agents/components/README.md` - Component API
- `convex/agents/README.md` - Tool reference

**External**:
- Claude Agent SDK: https://github.com/anthropics/claude-agent-sdk
- OpenRouter: https://openrouter.ai/docs

---

## Get Help

**Stuck?**
1. Check Convex logs: `npx convex dashboard`
2. Check browser console for frontend errors
3. Review `agents/docs/FUTURE_WORK.md` section on troubleshooting

**Questions?**
- Is the Convex AI Component API different? Check `node_modules/@convex-dev/agent/`
- Are tools not being called? Check system prompt encourages tool use
- Are responses slow? Check OpenRouter dashboard for rate limits

---

## Success Criteria

**You're done when**:
✅ User asks "Show me warehouses" → Fabiola calls `search_facilities` tool
✅ Response includes actual facility names and data
✅ Different queries trigger different tools automatically
✅ No placeholder responses remain

---

## Time Estimate

- **Minimum** (if everything works first try): 1 hour
- **Typical** (with debugging): 4-6 hours
- **Maximum** (if API differences found): 1-2 days

---

## After Integration

### Create Admin Route

**Create**: `app/admin/page.tsx`
```typescript
import JaynetteAdmin from "@/agents/components/JaynetteAdmin";

export default function AdminPage() {
  return <JaynetteAdmin />;
}
```

**Test**: http://localhost:3000/admin

### Deploy to Production

```bash
# 1. Set environment variables in Convex dashboard
# 2. Deploy Convex
npx convex deploy

# 3. Deploy Next.js
vercel deploy  # or AWS Amplify

# 4. Test production
```

---

## What You Get After Integration

**Public users** can:
- Ask about facilities in natural language
- Get intelligent responses with real data
- Search by name, type, region, or location
- See facility details, capacity, and services

**Admins** can:
- Create facilities with natural language commands
- Update facility information conversationally
- Bulk import facilities from descriptions
- Generate reports on demand
- All with AI assistance

---

## Questions Before You Start?

Read these first:
- `agents/docs/FUTURE_WORK.md` - Answers 90% of questions
- `agents/IMPLEMENTATION_SUMMARY.md` - What's been built
- `agents/docs/ARCHITECTURE.md` - How it all fits together

Still stuck? Check the troubleshooting sections in FUTURE_WORK.md

---

**Good luck!** 🚀

The hard part is done. You're just connecting the dots.

---

**Last Updated**: 2025-10-03
**Next Developer**: You got this! 💪
