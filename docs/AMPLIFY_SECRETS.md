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

Follow this flow whenever a server route needs an AWS Amplify secret:

1. Resolve the value with `secret("<KEY>")` from `@aws-amplify/backend`.
2. Validate the resolved value is a non-empty string of the expected length.
3. Optionally fall back to `process.env` so local `.env` development continues to work.
4. Bubble up meaningful HTTP errors when the secret is missing or malformed before calling external services.

```typescript
import { NextResponse } from "next/server";
import { secret } from "@aws-amplify/backend";

const pplxSecret = secret("PPLX");
const MIN_PPLX_KEY_LENGTH = 10;

type ApiKeyResolution =
  | { status: "resolved"; apiKey: string; source: "secret" | "env" }
  | { status: "invalid"; source: "secret" | "env"; length: number }
  | { status: "missing" };

const resolvePplxApiKey = (): ApiKeyResolution => {
  const secretRaw = pplxSecret as unknown;
  const secretCandidate = typeof secretRaw === "string" ? secretRaw.trim() : undefined;

  if (secretRaw && typeof secretRaw !== "string") {
    console.warn("PPLX secret returned non-string value from secret(\"PPLX\") - falling back to process.env");
  }

  if (secretCandidate) {
    if (secretCandidate.length >= MIN_PPLX_KEY_LENGTH) {
      return { status: "resolved", apiKey: secretCandidate, source: "secret" };
    }
    return { status: "invalid", source: "secret", length: secretCandidate.length };
  }

  const envCandidate = process.env.PPLX?.trim();

  if (envCandidate) {
    if (envCandidate.length >= MIN_PPLX_KEY_LENGTH) {
      return { status: "resolved", apiKey: envCandidate, source: "env" };
    }
    return { status: "invalid", source: "env", length: envCandidate.length };
  }

  return { status: "missing" };
};

export async function POST(req: Request) {
  try {
    const resolvedApiKey = resolvePplxApiKey();

    if (resolvedApiKey.status === "missing") {
      return NextResponse.json(
        {
          error: "API configuration error",
          message: "Chat service is not properly configured (missing PPLX secret)"
        },
        { status: 500 }
      );
    }

    if (resolvedApiKey.status === "invalid") {
      return NextResponse.json(
        {
          error: "API configuration error",
          message: "Chat service configuration is invalid (PPLX secret is malformed)",
          detail: `Resolved from ${resolvedApiKey.source} with length ${resolvedApiKey.length}`
        },
        { status: 500 }
      );
    }

    const { apiKey } = resolvedApiKey;

    const { messages } = (await req.json()) as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format", message: "Messages array is required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model: "sonar", messages, temperature: 0.2, stream: false })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json(
        {
          error: "External API error",
          message: errorBody || "Perplexity API error"
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred",
        detail
      },
      { status: 500 }
    );
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





