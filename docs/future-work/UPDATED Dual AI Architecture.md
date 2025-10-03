## Required Dependencies

```bash
# Claude Agent SDK (TypeScript)
npm install @anthropic-ai/claude-agent-sdk

# Claude Code CLI (required for the SDK)
npm install -g @anthropic-ai/claude-code

# Additional dependencies for our implementation
npm install zod lucide-react react-markdown sonner
npm install -D @types/react-markdown

# Optional but recommended
npm install framer-motion date-fns
```

## Updated Architecture Document

# Dual AI Agent Architecture with Claude Agent SDK
## Fabiola & Jaynette Implementation

### Executive Summary

The Claude Agent SDK provides a production-ready framework built on top of Claude Code, offering context management, rich tool ecosystems, advanced permissions, and optimized Claude integration. We'll leverage this to build two specialized agents:

- **Fabiola**: Public-facing assistant using the SDK with read-only permissions
- **Jaynette**: Administrative assistant using the SDK with full database access

### Why Claude Agent SDK?

The SDK provides context management with automatic compaction, file operations, code execution, web search, MCP extensibility, fine-grained permission control, built-in error handling, session management, and automatic prompt caching.

## Implementation Architecture

```typescript
// lib/agents/config.ts
import { ClaudeAgentOptions } from "@anthropic-ai/claude-agent-sdk";

// Fabiola Configuration (Public Agent)
export const FABIOLA_CONFIG: ClaudeAgentOptions = {
  model: "claude-3-haiku-20240307",
  systemPrompt: `You are Fabiola, a friendly logistics assistant for Puerto Rico.
    You help users explore facilities and answer logistics questions.
    You have READ-ONLY access to the database.
    Be bilingual (English/Spanish) and helpful.`,
  permissionMode: "deny",  // Deny by default
  allowedTools: [
    "web_fetch",    // Can search web
    "read_file",    // Can read data
    // Custom tools we'll define
    "search_facilities",
    "get_facility_details",
    "get_nearby_facilities"
  ],
  disallowedTools: [
    "write_file",
    "run_bash",
    "execute_code"
  ],
  contextManagement: {
    maxContextSize: 100000,
    autoCompact: true
  }
};

// Jaynette Configuration (Admin Agent) 
export const JAYNETTE_CONFIG: ClaudeAgentOptions = {
  model: "claude-3.5-sonnet-20241022",
  systemPrompt: `You are Jaynette, an administrative assistant for database management.
    You help administrators manage facility data through natural language.
    Always validate data before operations.
    Confirm destructive operations.`,
  permissionMode: "accept",  // Allow most operations
  allowedTools: [
    "write_file",
    "read_file",
    "run_bash",
    "execute_code",
    // Admin tools
    "create_facility",
    "update_facility",
    "delete_facility",
    "bulk_import",
    "generate_report"
  ],
  contextManagement: {
    maxContextSize: 200000,
    autoCompact: true
  },
  hooks: {
    beforeToolCall: async (tool, args) => {
      // Audit logging for admin operations
      console.log(`Admin operation: ${tool} with args:`, args);
      return true;
    }
  }
};
```

## Custom Tool Implementation

### Using MCP (Model Context Protocol) for Custom Tools

```typescript
// lib/agents/tools/facilities.ts
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { api } from "@/convex/_generated/api";

// Create MCP server for Fabiola's read-only tools
export const fabiolaTools = createSdkMcpServer({
  name: "fabiola-facilities",
  version: "1.0.0",
  
  tools: {
    search_facilities: tool({
      description: "Search for logistics facilities",
      schema: z.object({
        search: z.string().optional(),
        type: z.enum(["warehouse", "port", "airport", "facility"]).optional(),
        region: z.string().optional()
      }),
      execute: async (args, { ctx }) => {
        const results = await ctx.runQuery(api.geoLocales.listWithDetails, args);
        return {
          success: true,
          data: results
        };
      }
    }),
    
    get_facility_details: tool({
      description: "Get detailed information about a facility",
      schema: z.object({
        facilityId: z.string()
      }),
      execute: async (args, { ctx }) => {
        const facility = await ctx.runQuery(api.geoLocales.getByIdWithDetails, {
          id: args.facilityId
        });
        return {
          success: true,
          data: facility
        };
      }
    }),
    
    get_nearby_facilities: tool({
      description: "Find facilities near coordinates",
      schema: z.object({
        lat: z.number(),
        lng: z.number(),
        radiusKm: z.number().default(10)
      }),
      execute: async (args) => {
        // Validate Puerto Rico bounds
        if (args.lat < 17.5 || args.lat > 18.6 || 
            args.lng < -67.5 || args.lng > -65.0) {
          throw new Error("Coordinates must be within Puerto Rico");
        }
        
        const facilities = await ctx.runQuery(api.fabiola.tools.getFacilitiesNearby, args);
        return {
          success: true,
          data: facilities
        };
      }
    })
  }
});

// Admin tools for Jaynette
export const jaynetteTools = createSdkMcpServer({
  name: "jaynette-admin",
  version: "1.0.0",
  
  tools: {
    create_facility: tool({
      description: "Create a new facility",
      schema: z.object({
        name: z.string(),
        type: z.enum(["warehouse", "port", "airport", "facility"]),
        coordinates: z.object({
          lat: z.number().min(17.5).max(18.6),
          lng: z.number().min(-67.5).max(-65.0)
        }),
        description: z.string().optional(),
        region: z.string().optional()
      }),
      execute: async (args, { ctx }) => {
        const adminKey = process.env.ADMIN_SECRET_KEY!;
        
        const locationId = await ctx.runMutation(api.geoLocales.adminCreate, {
          adminKey,
          ...args,
          isActive: true
        });
        
        return {
          success: true,
          locationId,
          message: `Facility "${args.name}" created successfully`
        };
      }
    }),
    
    bulk_import: tool({
      description: "Import multiple facilities",
      schema: z.object({
        facilities: z.array(z.object({
          name: z.string(),
          type: z.string(),
          lat: z.number(),
          lng: z.number(),
          description: z.string().optional()
        })),
        dryRun: z.boolean().default(false)
      }),
      execute: async (args, { ctx }) => {
        const results = {
          successful: [],
          failed: []
        };
        
        for (const facility of args.facilities) {
          try {
            // Validate PR bounds
            if (facility.lat < 17.5 || facility.lat > 18.6) {
              throw new Error("Invalid latitude");
            }
            
            if (!args.dryRun) {
              const id = await ctx.runMutation(api.geoLocales.adminCreate, {
                adminKey: process.env.ADMIN_SECRET_KEY!,
                name: facility.name,
                type: facility.type,
                coordinates: { lat: facility.lat, lng: facility.lng },
                description: facility.description,
                isActive: true
              });
              
              results.successful.push({ name: facility.name, id });
            }
          } catch (error) {
            results.failed.push({ name: facility.name, error: error.message });
          }
        }
        
        return results;
      }
    })
  }
});
```

## Agent Implementation with SDK

### Fabiola Agent

```typescript
// convex/agents/fabiola.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { ClaudeSDKClient } from "@anthropic-ai/claude-agent-sdk";
import { FABIOLA_CONFIG } from "@/lib/agents/config";
import { fabiolaTools } from "@/lib/agents/tools/facilities";

export const chat = action({
  args: {
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string()
    })),
    sessionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Initialize SDK client
    const client = new ClaudeSDKClient({
      ...FABIOLA_CONFIG,
      mcpServers: [fabiolaTools],
      sessionId: args.sessionId
    });
    
    // Handle conversation
    const response = await client.sendMessage({
      messages: args.messages,
      stream: false
    });
    
    // Extract tool usage for UI feedback
    const toolsUsed = response.toolCalls?.map(tc => tc.name) || [];
    
    return {
      message: response.content,
      toolsUsed,
      sessionId: client.sessionId
    };
  }
});
```

### Jaynette Agent

```typescript
// convex/agents/jaynette.ts
import { action } from "../_generated/server";
import { v } from "convex/values";
import { ClaudeSDKClient } from "@anthropic-ai/claude-agent-sdk";
import { JAYNETTE_CONFIG } from "@/lib/agents/config";
import { jaynetteTools } from "@/lib/agents/tools/admin";

export const adminChat = action({
  args: {
    sessionToken: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant")),
      content: v.string()
    })),
    sessionId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Validate admin session
    const session = await ctx.runQuery(api.adminSessions.validate, {
      token: args.sessionToken
    });
    
    if (!session.valid) {
      throw new Error("Invalid admin session");
    }
    
    // Initialize admin client with hooks for auditing
    const client = new ClaudeSDKClient({
      ...JAYNETTE_CONFIG,
      mcpServers: [jaynetteTools],
      sessionId: args.sessionId,
      hooks: {
        afterToolCall: async (tool, args, result) => {
          // Audit log
          await ctx.runMutation(api.auditLog.create, {
            sessionToken: args.sessionToken,
            action: tool,
            args,
            result: result.success ? "success" : "failure",
            timestamp: Date.now()
          });
        }
      }
    });
    
    const response = await client.sendMessage({
      messages: args.messages,
      stream: false
    });
    
    return {
      message: response.content,
      toolsUsed: response.toolCalls?.map(tc => tc.name) || [],
      sessionId: client.sessionId
    };
  }
});
```

## Using Streaming Mode for Better UX

```typescript
// components/agents/FabiolaChat.tsx
"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ClaudeSDKClient } from "@anthropic-ai/claude-agent-sdk";

export default function FabiolaChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  
  const sendMessage = async (input: string) => {
    setIsStreaming(true);
    setCurrentMessage("");
    
    // Use streaming mode for real-time responses
    const client = new ClaudeSDKClient({
      model: "claude-3-haiku-20240307",
      stream: true
    });
    
    // Stream the response
    for await (const chunk of client.streamMessage({ 
      content: input,
      messages 
    })) {
      if (chunk.type === "content") {
        setCurrentMessage(prev => prev + chunk.text);
      } else if (chunk.type === "tool_call") {
        console.log("Tool called:", chunk.name);
      }
    }
    
    setIsStreaming(false);
    setMessages(prev => [...prev, {
      role: "assistant",
      content: currentMessage
    }]);
  };
  
  // Rest of component...
}
```

## Environment Setup

```env
# .env.local

# Claude API Key (from Claude Console)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx

# For using AWS Bedrock instead (optional)
# CLAUDE_CODE_USE_BEDROCK=1
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=xxxx
# AWS_SECRET_ACCESS_KEY=xxxx

# For using Google Vertex AI instead (optional)  
# CLAUDE_CODE_USE_VERTEX=1
# GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Admin Security
ADMIN_SECRET_KEY=your-existing-key
ADMIN_INTERFACE_PASSWORD=secure-password

# Your existing vars
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
CONVEX_DEPLOYMENT=xxx
NEXT_PUBLIC_CONVEX_URL=xxx
```

## Key Advantages of Claude Agent SDK

1. **Built-in Context Management**: Automatic context compaction ensures agents don't run out of context
2. **Structured Agent Loop**: Gather context → take action → verify work → repeat
3. **Production Ready**: Error handling, session management, and monitoring built-in
4. **MCP Support**: Easy integration with external services through Model Context Protocol
5. **Fine-grained Permissions**: Control exactly what each agent can do
6. **Code Generation Excellence**: The SDK excels at generating precise, composable, and reusable code

## Migration from Previous Architecture

The main changes from the previous architecture:

1. **Replace OpenRouter/OpenAI SDK** → Use `@anthropic-ai/claude-agent-sdk`
2. **Tool Definitions** → Use MCP servers with `createSdkMcpServer`
3. **Direct API Calls** → Use `ClaudeSDKClient` with streaming support
4. **Manual Context Management** → Automatic with SDK
5. **Custom Rate Limiting** → Built into SDK

This approach is much cleaner and leverages Anthropic's official infrastructure that powers Claude Code itself!