# AWS Amplify Secrets Management Guide

## Overview

This document outlines how to manage secrets and environment variables in AWS Amplify for the Puerto Rico Logistics Map application. The chat API requires a Perplexity API key (`PPLX`) that must be securely managed.

## ⚠️ IMPORTANT: Secrets vs Environment Variables

| Feature | Secrets (✅ Recommended) | Environment Variables (❌ Avoid for sensitive data) |
|---------|-------------------------|----------------------------------------------------|
| **Purpose** | Sensitive data (API keys, passwords) | Non-sensitive configuration |
| **Storage** | Encrypted in AWS Parameter Store | Plaintext in Amplify service |
| **Security** | Values never exposed | **Visible in build artifacts & logs** |
| **Access** | `secret()` function | `process.env` |
| **Best Practice** | ✅ Use for PPLX API key | ❌ **Never** store secrets here |

**Key Rule**: AWS explicitly states "do not store secret values in environment variables"

## Setup Instructions

### 1. AWS Amplify Console Setup (Using Secrets)

1. Navigate to your Amplify app in AWS Console
2. Go to **Hosting** → **Secrets**
3. Click **Manage secrets**
4. Add the following secret:
   - Key: `PPLX`
   - Value: `your_perplexity_api_key`
   - Apply to: All branches (or specific branches as needed)

### 2. Build Specification Configuration

The `amplify.yml` file should only handle public environment variables. Secrets are automatically available via the `secret()` function:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable pnpm
        - pnpm install --frozen-lockfile
    build:
      commands:
        # Only make public environment variables available to Next.js
        - env | grep -e NEXT_PUBLIC_ >> .env.production
        - pnpm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - .pnpm-store/**
```

### 3. Local Development

For local development, use Amplify's sandbox secrets:

```bash
# Set secret in local sandbox
npx ampx sandbox secret set PPLX
# You'll be prompted to enter your API key securely
```

**Alternative**: If you need to use `.env.local` for local development:
```bash
# Server-side variables (never exposed to browser)
PPLX=your_local_perplexity_api_key
```

**Important**: Never commit the actual `.env.local` file to version control.

## Security Best Practices

1. **Never store secrets in environment variables long-term** - Use AWS Secrets Manager for production
2. **Use least privilege access** - Ensure your Amplify app has minimal required permissions
3. **Rotate API keys regularly** - Update both local and Amplify console values
4. **Monitor usage** - Track API usage to detect unauthorized access

## Code Implementation

In your API routes, use the `secret()` function to access secrets:

```typescript
import { secret } from "@aws-amplify/backend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = secret("PPLX");
    if (!apiKey) {
      return NextResponse.json({ error: "Missing PPLX API key" }, { status: 500 });
    }

    // Use apiKey for Perplexity API calls
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    // ... rest of implementation
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## Troubleshooting

### Common Issues

1. **"Missing PPLX API key" error**
   - Verify the secret is set in Amplify console under Hosting → Secrets
   - Ensure you're using `secret("PPLX")` not `process.env.PPLX`
   - Check that `@aws-amplify/backend` is installed and imported

2. **Secrets not accessible at runtime**
   - Confirm the secret is properly set in Amplify console
   - Verify the secret name matches exactly (case-sensitive)
   - Ensure your Amplify app has proper permissions to access Parameter Store

3. **Local development issues**
   - Use `npx ampx sandbox secret set PPLX` for local secrets
   - Alternatively, ensure `.env.local` exists and contains the PPLX variable
   - Restart your development server after adding secrets/environment variables

### Debugging Steps

1. Check Amplify build logs for any secret-related errors
2. Verify API route can access the secret:
   ```typescript
   console.log("PPLX secret exists:", !!secret("PPLX"));
   ```
3. Test locally first using sandbox secrets, then deploy to ensure consistency
4. Check AWS Parameter Store in the console to verify secret storage

## Related Files

- `amplify.yml` - Build specification
- `.env.local` - Local development environment
- `.env.local.example` - Template for environment variables
- `app/api/chat/route.ts` - API route that uses the PPLX key
- `components/ChatbotFab.tsx` - Chat interface component

## References

- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)




