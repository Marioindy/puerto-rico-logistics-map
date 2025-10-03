# OpenRouter Integration

This directory contains the OpenRouter API client configuration for accessing Claude models.

## What is OpenRouter?

OpenRouter is a unified API gateway that provides access to multiple LLM providers through a single interface. Benefits include:

- **Unified API** - One API for multiple model providers
- **Automatic Fallback** - If primary provider fails, automatically tries alternatives
- **Cost Tracking** - Built-in usage analytics and billing
- **Rate Limiting** - Handled at provider level
- **Model Flexibility** - Easy to switch between models without code changes

## Setup

### 1. Create OpenRouter Account

1. Visit [https://openrouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Add credits to your account ($10 minimum recommended)

### 2. Generate API Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Click "Create Key"
3. Give it a name (e.g., "Puerto Rico Logistics Grid")
4. Copy the key (starts with `sk-or-v1-`)

### 3. Add to Environment

Add to `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

## Model Selection

We use different Claude models for different agents:

### Fabiola (Public Agent)
**Model:** `anthropic/claude-3-haiku`
**Cost:** $0.25/1M input tokens, $1.25/1M output tokens
**Why:** Fast, cost-effective for simple queries
**Use Case:** Public-facing chat with high volume

### Jaynette (Admin Agent)
**Model:** `anthropic/claude-3.5-sonnet-20241022`
**Cost:** $3/1M input tokens, $15/1M output tokens
**Why:** Advanced reasoning for complex operations
**Use Case:** Admin operations requiring precision

## Cost Estimation

Based on typical usage:

| Agent | Monthly Queries | Est. Tokens | Est. Cost |
|-------|----------------|-------------|-----------|
| Fabiola | ~50,000 | ~200M | $50-100 |
| Jaynette | ~2,000 | ~10M | $20-40 |
| **Total** | ~52,000 | ~210M | **$70-140** |

### Cost Optimization Tips

1. **Use Appropriate Model** - Don't use Sonnet for simple queries
2. **Limit Context** - Only include necessary conversation history
3. **Cache Responses** - Implement caching for common queries
4. **Rate Limiting** - Prevent abuse with request limits
5. **Monitor Usage** - Check OpenRouter dashboard regularly

## Client Configuration

The `client.ts` file exports:

### Main Client

```typescript
import { openrouter } from '@/agents/lib/openrouter/client';

// Use for direct API calls
const response = await openrouter.chat.completions.create({
  model: 'anthropic/claude-3-haiku',
  messages: [...],
});
```

### Model Constants

```typescript
import { MODELS } from '@/agents/lib/openrouter/client';

console.log(MODELS.FABIOLA);   // "anthropic/claude-3-haiku"
console.log(MODELS.JAYNETTE);  // "anthropic/claude-3.5-sonnet-20241022"
```

### Model Information

```typescript
import { MODEL_INFO } from '@/agents/lib/openrouter/client';

const fabiolaInfo = MODEL_INFO[MODELS.FABIOLA];
console.log(fabiolaInfo.name);              // "Claude 3 Haiku"
console.log(fabiolaInfo.inputCostPer1M);    // 0.25
console.log(fabiolaInfo.contextWindow);     // 200000
```

### Cost Calculation

```typescript
import { estimateCost, MODELS } from '@/agents/lib/openrouter/client';

const cost = estimateCost(
  MODELS.FABIOLA,
  10000,  // input tokens
  2000    // output tokens
);

console.log(`Estimated cost: $${cost.toFixed(4)}`);
// Estimated cost: $0.0050
```

### Configuration Validation

```typescript
import { validateOpenRouterConfig } from '@/agents/lib/openrouter/client';

try {
  validateOpenRouterConfig();
  console.log('OpenRouter configured correctly');
} catch (error) {
  console.error('OpenRouter not configured:', error.message);
}
```

## Usage with Vercel AI SDK

The OpenRouter client is compatible with Vercel AI SDK:

```typescript
import { createOpenAI } from "@ai-sdk/openai";
import { MODELS } from '@/agents/lib/openrouter/client';

const openai = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Use with Convex Agent
const agent = new Agent(components.agent, {
  languageModel: openai(MODELS.FABIOLA),
  // ... other config
});
```

## Monitoring

### OpenRouter Dashboard

Visit [https://openrouter.ai/activity](https://openrouter.ai/activity) to monitor:

- **Token Usage** - Real-time token consumption
- **Cost** - Current spend and projections
- **Request Logs** - Detailed request history
- **Model Stats** - Performance by model
- **Error Rates** - Failed requests and reasons

### Alerts

Set up alerts in OpenRouter dashboard:
- Budget threshold alerts
- High error rate notifications
- Unusual usage patterns

## Rate Limits

Default OpenRouter rate limits:

| Tier | Requests/Min | Tokens/Min |
|------|--------------|------------|
| Free | 20 | 200,000 |
| Paid | 3,600 | Unlimited |

Our application implements additional limits:
- **Fabiola:** 20 requests/minute per user
- **Jaynette:** 50 requests/minute per admin session

## Error Handling

Common errors and solutions:

### Authentication Error
```
Error: 401 Unauthorized
```
**Solution:** Check `OPENROUTER_API_KEY` is set correctly

### Insufficient Credits
```
Error: 402 Payment Required
```
**Solution:** Add credits at [https://openrouter.ai/credits](https://openrouter.ai/credits)

### Rate Limit
```
Error: 429 Too Many Requests
```
**Solution:** Implement exponential backoff or reduce request rate

### Model Not Available
```
Error: 503 Service Unavailable
```
**Solution:** OpenRouter will automatically try fallback models

## Security Best Practices

✅ **Never commit API keys** - Use environment variables only
✅ **Rotate keys regularly** - Generate new keys periodically
✅ **Use separate keys** - Different keys for dev/staging/production
✅ **Monitor usage** - Watch for unexpected spikes
✅ **Set spending limits** - Configure budgets in dashboard

## Alternative Providers

OpenRouter supports fallback to alternative providers:

1. **Primary:** Anthropic (via OpenRouter)
2. **Fallback 1:** Anthropic (direct API)
3. **Fallback 2:** Other Claude providers

Configuration:

```typescript
export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
    'X-Title': 'Puerto Rico Logistics Grid',
  },
});
```

## Troubleshooting

### Issue: High costs

1. Check usage in OpenRouter dashboard
2. Review conversation history length
3. Verify you're using correct model (Haiku vs Sonnet)
4. Implement caching for repeated queries

### Issue: Slow responses

1. Check OpenRouter status page
2. Verify network connectivity
3. Consider using Haiku for faster responses
4. Reduce context window size

### Issue: API key not working

1. Verify key starts with `sk-or-v1-`
2. Check key is active in dashboard
3. Ensure environment variable is loaded
4. Restart development server

## Support Resources

- **OpenRouter Docs:** [https://openrouter.ai/docs](https://openrouter.ai/docs)
- **Discord:** [https://discord.gg/openrouter](https://discord.gg/openrouter)
- **Status Page:** [https://status.openrouter.ai](https://status.openrouter.ai)

---

**Last Updated:** 2025-10-03
