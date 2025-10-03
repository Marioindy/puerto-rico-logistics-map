# Deployment Guide

This guide covers environment setup, deployment steps, and configuration for the AI agent system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development Setup](#local-development-setup)
4. [Production Deployment](#production-deployment)
5. [Vercel Deployment](#vercel-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

1. **OpenRouter Account**
   - Sign up at [https://openrouter.ai](https://openrouter.ai)
   - Add credits to your account
   - Generate API key from dashboard

2. **Anthropic Account** (Optional fallback)
   - Sign up at [https://console.anthropic.com](https://console.anthropic.com)
   - Generate API key
   - Used as fallback if OpenRouter fails

3. **Convex Account**
   - Already set up for this project
   - Deployment URL in `.env.local`

### System Requirements

- Node.js 18+ or higher
- pnpm package manager
- Git

---

## Environment Variables

### Required Variables

Create or update `.env.local` in the project root:

```env
# ============================================
# OpenRouter API (Primary LLM Provider)
# ============================================
# Get from: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Anthropic API (Optional Fallback)
# ============================================
# Get from: https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ============================================
# Admin Security
# ============================================
# Use your existing Convex admin key
# This protects all database write operations
ADMIN_SECRET_KEY=your-existing-convex-admin-key

# Password for Jaynette admin interface
# Minimum 12 characters recommended
ADMIN_INTERFACE_PASSWORD=your-secure-admin-password-here

# ============================================
# Convex (Existing Configuration)
# ============================================
CONVEX_DEPLOYMENT=your-deployment-name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ============================================
# Google Maps (Existing Configuration)
# ============================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# ============================================
# Site Configuration (for OpenRouter)
# ============================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Environment Variable Details

| Variable | Purpose | Where to Get | Required |
|----------|---------|--------------|----------|
| `OPENROUTER_API_KEY` | Primary LLM API access | [OpenRouter Dashboard](https://openrouter.ai/keys) | Yes |
| `ANTHROPIC_API_KEY` | Fallback LLM access | [Anthropic Console](https://console.anthropic.com) | No |
| `ADMIN_SECRET_KEY` | Database write protection | Existing Convex setup | Yes |
| `ADMIN_INTERFACE_PASSWORD` | Admin UI login | Create your own | Yes |
| `CONVEX_DEPLOYMENT` | Convex project ID | Existing setup | Yes |
| `NEXT_PUBLIC_CONVEX_URL` | Convex API endpoint | Existing setup | Yes |

---

## Local Development Setup

### Step 1: Install Dependencies

```bash
# Install all packages
pnpm install
```

### Step 2: Configure Convex AI Component

Create `convex/convex.config.ts`:

```typescript
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

### Step 3: Initialize Convex Component

```bash
# Start Convex in development mode
# This will generate component code and types
npx convex dev
```

**Expected Output:**
```
✓ Component @convex-dev/agent initialized
✓ Generated component code in convex/_generated/
✓ Watching for changes...
```

**Important:** Keep this process running. It watches for changes and regenerates types.

### Step 4: Update Database Schema

The Convex AI Component automatically adds these tables:
- `threads` - Conversation threads
- `messages` - Individual messages

You need to manually add the `adminSessions` table to `convex/schema.ts`:

```typescript
// Add to your existing schema
adminSessions: defineTable({
  token: v.string(),
  userId: v.string(),
  expiresAt: v.number(),
  createdAt: v.number(),
}).index("by_token", ["token"]),
```

### Step 5: Start Development Server

```bash
# In a new terminal
pnpm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3000
✓ Convex functions ready
```

### Step 6: Verify Setup

Visit these URLs to verify:

1. **Main App**: `http://localhost:3000`
2. **RFI Map with Fabiola**: `http://localhost:3000/rfimap`
3. **Admin Interface**: `http://localhost:3000/admin`
4. **Convex Dashboard**: Check your Convex dashboard for new tables

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All environment variables set in production
- [ ] OpenRouter API key has sufficient credits
- [ ] Admin password is strong (12+ characters)
- [ ] Convex schema deployed to production
- [ ] Type checking passes (`pnpm run typecheck`)
- [ ] Build succeeds (`pnpm run build`)

### Step 1: Deploy Convex Schema

```bash
# Deploy schema and functions to production
npx convex deploy --prod
```

### Step 2: Set Production Environment Variables

In your hosting platform (Vercel, etc.), add all environment variables from `.env.local`.

**Note:** Remove the `NEXT_PUBLIC_SITE_URL` or update it to your production domain.

### Step 3: Deploy Application

```bash
# Build for production
pnpm run build

# Deploy based on your hosting
# Example for Vercel:
vercel --prod
```

### Step 4: Verify Production Deployment

1. **Test Fabiola** (Public Agent)
   - Visit `/rfimap` on production
   - Open chat widget
   - Send test message: "Show me all warehouses"
   - Verify response and tool usage

2. **Test Jaynette** (Admin Agent)
   - Visit `/admin` on production
   - Login with admin password
   - Send test command: "Show me a summary of all facilities"
   - Verify database access works

---

## Vercel Deployment

### Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add all variables for Production, Preview, and Development:

```
OPENROUTER_API_KEY          = sk-or-v1-...
ANTHROPIC_API_KEY           = sk-ant-api03-...
ADMIN_SECRET_KEY            = your-admin-key
ADMIN_INTERFACE_PASSWORD    = your-password
CONVEX_DEPLOYMENT           = prod:deployment-name
NEXT_PUBLIC_CONVEX_URL      = https://your-deployment.convex.cloud
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = your-maps-key
NEXT_PUBLIC_SITE_URL        = https://your-domain.vercel.app
```

### Deployment Steps

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Verify Functions**
   - Check Vercel Functions tab
   - Confirm Convex backend is connected
   - Test API routes

---

## Troubleshooting

### Issue: "Cannot find module 'components'"

**Cause:** Convex AI Component not initialized

**Solution:**
```bash
# Make sure convex.config.ts exists
# Run Convex dev to generate component code
npx convex dev
```

### Issue: "OpenRouter API key invalid"

**Cause:** Invalid or missing API key

**Solution:**
1. Verify key in OpenRouter dashboard
2. Check key has no extra spaces
3. Ensure environment variable is loaded:
   ```bash
   echo $OPENROUTER_API_KEY  # Should show your key
   ```

### Issue: "Admin session invalid"

**Cause:** Session expired or password incorrect

**Solution:**
1. Sessions expire after 4 hours
2. Clear browser cookies
3. Re-login with correct password
4. Check `ADMIN_INTERFACE_PASSWORD` matches

### Issue: "Tool execution failed"

**Cause:** Missing ADMIN_SECRET_KEY or database permission error

**Solution:**
1. Verify `ADMIN_SECRET_KEY` is set
2. Check Convex dashboard for errors
3. Ensure admin mutations have proper key validation

### Issue: Build fails with type errors

**Cause:** Generated types not updated

**Solution:**
```bash
# Regenerate Convex types
npx convex dev

# Check for TypeScript errors
pnpm run typecheck
```

### Issue: Real-time updates not working

**Cause:** WebSocket connection issues

**Solution:**
1. Check browser console for WebSocket errors
2. Verify `NEXT_PUBLIC_CONVEX_URL` is correct
3. Ensure Convex deployment is active
4. Check firewall/network settings

---

## Monitoring and Maintenance

### Daily Checks

1. **OpenRouter Dashboard**
   - Check token usage
   - Monitor costs
   - Verify API status

2. **Convex Dashboard**
   - Check function execution logs
   - Monitor database queries
   - Review error logs

3. **Application Logs**
   - Check for failed tool executions
   - Monitor session creation/expiry
   - Review audit logs (Jaynette operations)

### Weekly Tasks

1. **Cost Analysis**
   - Review LLM usage by agent
   - Compare Haiku vs Sonnet costs
   - Optimize if needed

2. **Security Review**
   - Check admin session logs
   - Review failed authentication attempts
   - Rotate admin password if needed

3. **Performance Check**
   - Monitor agent response times
   - Check database query performance
   - Review thread/message growth

### Monthly Tasks

1. **Dependency Updates**
   ```bash
   pnpm update @convex-dev/agent
   pnpm update @anthropic-ai/claude-agent-sdk
   ```

2. **Backup Review**
   - Export critical threads/messages
   - Backup admin session configurations
   - Document any custom modifications

---

## Rollback Procedure

If deployment has issues:

### Step 1: Revert Convex Deployment

```bash
# List recent deployments
npx convex deployments list

# Rollback to specific deployment
npx convex rollback <deployment-id>
```

### Step 2: Revert Application Deployment

**For Vercel:**
```bash
# From Vercel dashboard:
# Deployments → Previous Deployment → Promote to Production
```

### Step 3: Verify Rollback

1. Check Convex functions are running
2. Test Fabiola chat interface
3. Test Jaynette admin interface
4. Verify database operations work

---

## Performance Optimization

### Agent Response Time

**Target:** < 2 seconds for simple queries

**Optimizations:**
- Use streaming responses for better perceived performance
- Cache frequently requested data
- Optimize tool execution order

### Database Performance

**Target:** < 100ms for queries

**Optimizations:**
- Add indexes for common query patterns
- Limit message history retrieval
- Use pagination for large result sets

### Cost Optimization

**Current Estimates:**
- Fabiola: ~$50-100/month (Claude 3 Haiku)
- Jaynette: ~$20-40/month (Claude 3.5 Sonnet)

**Savings Strategies:**
- Implement response caching
- Limit max conversation length
- Use Haiku for simple admin tasks

---

## Support Resources

### Documentation
- [Convex AI Component Docs](https://docs.convex.dev/agents)
- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk)
- [OpenRouter API Docs](https://openrouter.ai/docs)

### Community
- Convex Discord
- Anthropic Discord
- Project GitHub Issues

---

**Last Updated:** 2025-10-03
**Next Review:** 2025-11-01
