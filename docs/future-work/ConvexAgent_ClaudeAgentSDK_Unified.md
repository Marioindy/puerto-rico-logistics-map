# Architecture: Convex AI Component + Claude Agent SDK
## Installation

```bash
# Claude Agent SDK
npm install @anthropic-ai/claude-agent-sdk

# Convex AI Component
npm install @convex-dev/agents

# AI SDK for provider abstraction
npm install @ai-sdk/anthropic ai

# Additional dependencies
npm install zod lucide-react react-markdown sonner
npm install -D @types/react-markdown
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
├─────────────────────────────────────────────────────────────┤
│                    Convex Database                           │
│  geoLocales, facilityBoxes, facilityVariables, threads      │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Schema Updates

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Add to your existing schema
export default defineSchema({
  // ... existing tables ...
  
  // Agent Component tables (auto-managed)
  threads: defineTable({
    userId: v.optional(v.string()),
    agentName: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  
  messages: defineTable({
    threadId: v.id("threads"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),
  
  // Admin sessions for Jaynette
  adminSessions: defineTable({
    token: v.string(),
    userId: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),
});
```

### 2. Agent Configuration

```typescript
// lib/agents/config.ts
import { ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";

export const FABIOLA_SDK_CONFIG: ClaudeAgentOptions = {
  model: "claude-3-haiku-20240307",
  permissionMode: "deny",
  allowedTools: [
    "web_fetch",
    "search_facilities",
    "get_facility_details",
    "get_nearby_facilities",
  ],
  disallowedTools: [
    "write_file",
    "run_bash",
    "execute_code"
  ],
};

export const JAYNETTE_SDK_CONFIG: ClaudeAgentOptions = {
  model: "claude-3.5-sonnet-20241022",
  permissionMode: "accept",
  allowedTools: [
    "create_facility",
    "update_facility",
    "delete_facility",
    "bulk_import",
    "generate_report"
  ],
};
```

### 3. Fabiola Agent Implementation

```typescript
// convex/agents/fabiola.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { ClaudeSDKClient, createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { Agent } from "@convex-dev/agents";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { api } from "../_generated/api";
import { FABIOLA_SDK_CONFIG } from "@/lib/agents/config";
import { z } from "zod";

// Create MCP tools for Claude SDK
const fabiolaTools = createSdkMcpServer({
  name: "fabiola-tools",
  version: "1.0.0",
  tools: {
    search_facilities: tool({
      description: "Search for logistics facilities",
      schema: z.object({
        search: z.string().optional(),
        type: z.enum(["warehouse", "port", "airport", "facility"]).optional(),
        region: z.string().optional(),
      }),
      execute: async (args, { ctx }) => {
        const results = await ctx.runQuery(api.geoLocales.listWithDetails, args);
        return { success: true, data: results };
      },
    }),
    
    get_facility_details: tool({
      description: "Get detailed facility information",
      schema: z.object({
        facilityId: z.string(),
      }),
      execute: async (args, { ctx }) => {
        const details = await ctx.runQuery(api.geoLocales.getByIdWithDetails, {
          id: args.facilityId
        });
        return { success: true, data: details };
      },
    }),
    
    get_nearby_facilities: tool({
      description: "Find facilities near coordinates",
      schema: z.object({
        lat: z.number().min(17.5).max(18.6),
        lng: z.number().min(-67.5).max(-65.0),
        radiusKm: z.number().optional().default(10),
      }),
      execute: async (args, { ctx }) => {
        const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
          activeOnly: true
        });
        
        // Calculate distances and filter
        const nearbyFacilities = facilities
          .map(f => ({
            ...f,
            distance: calculateDistance(
              args.lat, args.lng,
              f.coordinates.lat, f.coordinates.lng
            )
          }))
          .filter(f => f.distance <= args.radiusKm)
          .sort((a, b) => a.distance - b.distance);
        
        return { success: true, data: nearbyFacilities };
      },
    }),
  },
});

// Define Convex Agent for thread management
const fabiolaConvexAgent = new Agent(components.agent, {
  name: "Fabiola",
  model: anthropic("claude-3-haiku-20240307"),
  instructions: "Thread management agent",
});

// Create thread action
export const createThread = action({
  args: {
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create thread using Convex Agent
    const { threadId } = await fabiolaConvexAgent.createThread(ctx, {
      metadata: { userId: args.userId }
    });
    
    return { threadId };
  },
});

// Chat action combining both SDKs
export const chat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { threadId, message }) => {
    // Get thread history from Convex
    const thread = fabiolaConvexAgent.thread(ctx, { threadId });
    const messages = await thread.getMessages();
    
    // Initialize Claude SDK with context
    const claudeClient = new ClaudeSDKClient({
      ...FABIOLA_SDK_CONFIG,
      mcpServers: [fabiolaTools],
      systemPrompt: `You are Fabiola, a friendly logistics assistant for Puerto Rico.
        Help users explore facilities and answer logistics questions.
        You have READ-ONLY access to the database.
        Be bilingual (English/Spanish) and helpful.
        
        Previous conversation context:
        ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}`,
    });
    
    // Process with Claude SDK
    const response = await claudeClient.sendMessage({
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ],
      stream: false,
    });
    
    // Store response in Convex thread
    await thread.addMessage({
      role: "assistant",
      content: response.content,
      metadata: {
        toolsUsed: response.toolCalls?.map(tc => tc.name),
        claudeSessionId: claudeClient.sessionId,
      },
    });
    
    return {
      message: response.content,
      toolsUsed: response.toolCalls?.map(tc => tc.name) || [],
    };
  },
});

// Streaming version for better UX
export const streamChat = action({
  args: {
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { threadId, message }) => {
    const thread = fabiolaConvexAgent.thread(ctx, { threadId });
    const messages = await thread.getMessages();
    
    const claudeClient = new ClaudeSDKClient({
      ...FABIOLA_SDK_CONFIG,
      mcpServers: [fabiolaTools],
      stream: true,
    });
    
    // Stream response chunks
    const chunks = [];
    for await (const chunk of claudeClient.streamMessage({
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ],
    })) {
      chunks.push(chunk);
      
      // Store partial response for real-time updates
      await ctx.runMutation(api.streaming.updatePartialMessage, {
        threadId,
        content: chunks.map(c => c.text || "").join(""),
      });
    }
    
    // Store final message
    const fullContent = chunks.map(c => c.text || "").join("");
    await thread.addMessage({
      role: "assistant",
      content: fullContent,
    });
    
    return { success: true };
  },
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

### 4. Jaynette Admin Agent

```typescript
// convex/agents/jaynette.ts
import { action, mutation } from "../_generated/server";
import { v } from "convex/values";
import { ClaudeSDKClient, createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { Agent } from "@convex-dev/agents";
import { anthropic } from "@ai-sdk/anthropic";
import { components } from "../_generated/api";
import { api } from "../_generated/api";
import { JAYNETTE_SDK_CONFIG } from "@/lib/agents/config";
import { z } from "zod";

// Admin tools for database management
const jaynetteTools = createSdkMcpServer({
  name: "jaynette-admin",
  version: "1.0.0",
  tools: {
    create_facility: tool({
      description: "Create a new facility in the database",
      schema: z.object({
        name: z.string(),
        type: z.enum(["warehouse", "port", "airport", "facility"]),
        coordinates: z.object({
          lat: z.number().min(17.5).max(18.6),
          lng: z.number().min(-67.5).max(-65.0),
        }),
        description: z.string().optional(),
        region: z.string().optional(),
      }),
      execute: async (args, { ctx }) => {
        const adminKey = process.env.ADMIN_SECRET_KEY!;
        
        const locationId = await ctx.runMutation(api.geoLocales.adminCreate, {
          adminKey,
          ...args,
          isActive: true,
        });
        
        return {
          success: true,
          locationId,
          message: `Created facility "${args.name}" successfully`,
        };
      },
    }),
    
    update_facility: tool({
      description: "Update an existing facility",
      schema: z.object({
        facilityId: z.string(),
        updates: z.object({
          name: z.string().optional(),
          type: z.string().optional(),
          coordinates: z.object({
            lat: z.number(),
            lng: z.number(),
          }).optional(),
          description: z.string().optional(),
          region: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }),
      execute: async (args, { ctx }) => {
        const adminKey = process.env.ADMIN_SECRET_KEY!;
        
        await ctx.runMutation(api.geoLocales.adminUpdate, {
          adminKey,
          id: args.facilityId,
          ...args.updates,
        });
        
        return {
          success: true,
          message: `Updated facility ${args.facilityId}`,
        };
      },
    }),
    
    bulk_import: tool({
      description: "Import multiple facilities at once",
      schema: z.object({
        facilities: z.array(z.object({
          name: z.string(),
          type: z.string(),
          lat: z.number(),
          lng: z.number(),
          description: z.string().optional(),
        })),
        dryRun: z.boolean().default(false),
      }),
      execute: async (args, { ctx }) => {
        const adminKey = process.env.ADMIN_SECRET_KEY!;
        const results = { successful: [], failed: [] };
        
        for (const facility of args.facilities) {
          try {
            if (!args.dryRun) {
              const id = await ctx.runMutation(api.geoLocales.adminCreate, {
                adminKey,
                name: facility.name,
                type: facility.type,
                coordinates: { lat: facility.lat, lng: facility.lng },
                description: facility.description,
                isActive: true,
              });
              results.successful.push({ name: facility.name, id });
            } else {
              results.successful.push({ name: facility.name, status: "would_create" });
            }
          } catch (error) {
            results.failed.push({ name: facility.name, error: error.message });
          }
        }
        
        return results;
      },
    }),
    
    generate_report: tool({
      description: "Generate facility reports",
      schema: z.object({
        reportType: z.enum(["summary", "detailed", "capacity"]),
        filters: z.object({
          type: z.string().optional(),
          region: z.string().optional(),
          activeOnly: z.boolean().optional(),
        }).optional(),
      }),
      execute: async (args, { ctx }) => {
        const facilities = await ctx.runQuery(api.geoLocales.listWithDetails, {
          type: args.filters?.type,
          region: args.filters?.region,
          activeOnly: args.filters?.activeOnly,
        });
        
        switch (args.reportType) {
          case "summary":
            return {
              total: facilities.length,
              byType: facilities.reduce((acc, f) => {
                acc[f.type] = (acc[f.type] || 0) + 1;
                return acc;
              }, {}),
              byRegion: facilities.reduce((acc, f) => {
                acc[f.region || "unknown"] = (acc[f.region || "unknown"] || 0) + 1;
                return acc;
              }, {}),
            };
          case "detailed":
            return facilities;
          default:
            return { facilities };
        }
      },
    }),
  },
});

// Admin Convex Agent
const jaynetteConvexAgent = new Agent(components.agent, {
  name: "Jaynette",
  model: anthropic("claude-3.5-sonnet-20241022"),
  instructions: "Administrative database management assistant",
});

// Admin authentication
export const authenticate = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.password !== process.env.ADMIN_INTERFACE_PASSWORD) {
      throw new Error("Invalid password");
    }
    
    const token = crypto.randomBytes(32).toString("hex");
    const sessionId = await ctx.db.insert("adminSessions", {
      token,
      userId: "admin",
      expiresAt: Date.now() + (4 * 60 * 60 * 1000),
      createdAt: Date.now(),
    });
    
    return { token, sessionId };
  },
});

// Admin chat with session validation
export const adminChat = action({
  args: {
    sessionToken: v.string(),
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { sessionToken, threadId, message }) => {
    // Validate session
    const session = await ctx.runQuery(api.adminSessions.validate, { token: sessionToken });
    if (!session.valid) {
      throw new Error("Invalid or expired session");
    }
    
    // Get thread history
    const thread = jaynetteConvexAgent.thread(ctx, { threadId });
    const messages = await thread.getMessages();
    
    // Initialize Claude SDK with admin tools
    const claudeClient = new ClaudeSDKClient({
      ...JAYNETTE_SDK_CONFIG,
      mcpServers: [jaynetteTools],
      systemPrompt: `You are Jaynette, an administrative database assistant.
        Help administrators manage facility data through natural language.
        Always validate data and confirm destructive operations.
        
        Session authenticated for: ${session.userId}`,
      hooks: {
        afterToolCall: async (tool, args, result) => {
          // Audit log
          await ctx.runMutation(api.auditLog.create, {
            sessionToken,
            action: tool,
            args,
            result: result.success ? "success" : "failure",
            timestamp: Date.now(),
          });
        },
      },
    });
    
    // Process with Claude SDK
    const response = await claudeClient.sendMessage({
      messages: [
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: message }
      ],
      stream: false,
    });
    
    // Store in thread
    await thread.addMessage({
      role: "assistant",
      content: response.content,
      metadata: {
        toolsUsed: response.toolCalls?.map(tc => tc.name),
        sessionId: session.sessionId,
      },
    });
    
    return {
      message: response.content,
      toolsUsed: response.toolCalls?.map(tc => tc.name) || [],
    };
  },
});
```

### 5. Frontend Components

```typescript
// components/agents/FabiolaChat.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageCircle, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function FabiolaChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const createThread = useAction(api.agents.fabiola.createThread);
  const chat = useAction(api.agents.fabiola.chat);
  
  // Get messages from Convex in real-time
  const messages = useQuery(
    api.messages.getByThread,
    threadId ? { threadId } : "skip"
  );
  
  // Initialize thread on first open
  useEffect(() => {
    if (isOpen && !threadId) {
      createThread({}).then(({ threadId }) => {
        setThreadId(threadId);
        toast.success("Chat session started");
      });
    }
  }, [isOpen]);
  
  const sendMessage = async () => {
    if (!input.trim() || !threadId || isLoading) return;
    
    setIsLoading(true);
    const userInput = input;
    setInput("");
    
    try {
      const response = await chat({
        threadId,
        message: userInput,
      });
      
      if (response.toolsUsed?.length > 0) {
        toast.info(`Used tools: ${response.toolsUsed.join(", ")}`);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#4b5a2a] to-[#5a6b34] text-white shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] rounded-2xl border border-[#e3dcc9] bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#e3dcc9] p-4 bg-gradient-to-r from-[#faf9f5] to-[#f5f4ed]">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#4b5a2a] to-[#5a6b34] flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#2e2f25]">Fabiola</h3>
              <p className="text-xs text-[#6f705f]">PR Logistics Assistant • Claude Haiku</p>
            </div>
          </div>
          
          {/* Messages (Real-time from Convex) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {!messages && threadId && (
              <div className="text-center text-gray-500">Loading conversation...</div>
            )}
            
            {messages?.map((message) => (
              <div
                key={message._id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#4b5a2a] to-[#5a6b34] text-white"
                      : "bg-[#f5f4ed] text-[#2e2f25] border border-[#e8e6dd]"
                  }`}
                >
                  <ReactMarkdown className="text-sm prose prose-sm max-w-none">
                    {message.content}
                  </ReactMarkdown>
                  {message.metadata?.toolsUsed && (
                    <div className="mt-2 pt-2 border-t border-[#00000010] text-xs opacity-75">
                      🔧 {message.metadata.toolsUsed.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f5f4ed] rounded-2xl px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-[#4b5a2a] rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-[#4b5a2a] rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-[#4b5a2a] rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-[#e3dcc9]">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about facilities, logistics..."
                className="flex-1 rounded-full border border-[#d7d1c3] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4b5a2a]"
                disabled={isLoading || !threadId}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim() || !threadId}
                className="rounded-full bg-gradient-to-r from-[#4b5a2a] to-[#5a6b34] p-2.5 text-white hover:shadow-lg disabled:opacity-50 transition-all"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## Environment Variables

```env
# .env.local

# Claude API (from Anthropic Console)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx

# Admin Security
ADMIN_SECRET_KEY=your-existing-convex-admin-key
ADMIN_INTERFACE_PASSWORD=secure-admin-password

# Your existing Convex vars
CONVEX_DEPLOYMENT=xxx
NEXT_PUBLIC_CONVEX_URL=xxx
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
```

## Key Advantages of This Architecture

1. **Best of Both Worlds**: 
   - Convex handles persistence, real-time updates, and thread management
   - Claude Agent SDK handles agent logic, context management, and tool execution

2. **Real-time Updates**: Messages appear instantly across all clients via Convex's reactive system

3. **Persistent Threads**: Conversation history is automatically saved and can be resumed

4. **Tool Flexibility**: Use Claude Agent SDK's MCP for custom tools while leveraging Convex queries

5. **Security**: Admin operations protected by both session tokens and Convex's admin keys

6. **Scalability**: Can handle multiple concurrent users with Convex's built-in scaling

This architecture gives you the powerful agent capabilities of Claude Agent SDK while leveraging Convex's excellent database and real-time features!