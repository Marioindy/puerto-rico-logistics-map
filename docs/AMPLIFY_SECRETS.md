# AWS Amplify Secrets Management Guide

## Overview

This document outlines how to manage secrets and environment variables in AWS Amplify for the Puerto Rico Logistics Map application. The chat API requires a Perplexity API key (`PPLX`) that must be securely managed.

> **🔍 Critical Discovery**: Based on extensive testing and a forum solution, Amplify Console Secrets **do not work** as documented. They create parameters with branch hash suffixes that Amplify's auto-injection ignores. **Manual SSM parameters at exact paths are required**.

## ⚠️ IMPORTANT: The Amplify Console Secrets Problem

| Method | Amplify Console Secrets (❌ **BROKEN**) | Manual SSM Parameters (✅ **WORKS**) |
|--------|----------------------------------------|-------------------------------------|
| **Path Created** | `/amplify/app-id/branch-hash-abc123/SECRET_NAME` | `/amplify/app-id/branch/SECRET_NAME` |
| **Amplify Auto-Injection** | ❌ Ignores these paths | ✅ Fetches from exact paths |
| **Result** | `secrets` env var is empty | `secrets` env var contains JSON |
| **Forum Discovery** | Creates wrong SSM paths | Creates correct SSM paths |

**Key Discovery**: Amplify only looks for parameters at exact path `/amplify/{app-id}/{branch}/` - NOT the branch hash suffix path that Console Secrets creates.

## Setup Instructions

### 1. Manual SSM Parameter Creation (✅ Working Solution)

**App Configuration:**
- App ID: `dawq158evhzhz`
- Current Branch: `main-convex-refactor`
- Production Branch: `main`

**Critical**: Create SSM parameters at exact paths that Amplify expects:

```bash
# For current branch (main-convex-refactor):
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX" \
  --value "your_perplexity_api_key" \
  --type "SecureString" \
  --overwrite

# For production branch (main):
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main/PPLX" \
  --value "your_perplexity_api_key" \
  --type "SecureString" \
  --overwrite
```

**Quick Setup**: Use the provided scripts:
- `scripts/setup-ssm-secrets.sh` (Linux/Mac)
- `scripts/setup-ssm-secrets.bat` (Windows)
- `scripts/SSM_COMMANDS.md` (Copy-paste commands)

### 2. Build Specification Configuration

The `amplify.yml` has been enhanced to implement the forum solution for parsing Amplify's `secrets` JSON environment variable:

**How it works:**
1. Amplify fetches SSM parameters from `/amplify/{app-id}/{branch}/` and provides them as a single JSON variable called `secrets`
2. Our enhanced `amplify.yml` parses this JSON to extract individual secrets
3. Individual secrets are exported as environment variables and written to `.env.production`

**Key features implemented:**
- ✅ Robust JSON parsing with error handling
- ✅ Comprehensive debug logging
- ✅ Validation for critical secrets (PPLX)
- ✅ Length validation and status reporting
- ✅ Fallback messaging when secrets are missing

**Current amplify.yml structure:**
- Parses: `PPLX`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, and optional Convex secrets
- Validates critical secrets before build
- Provides detailed logging for debugging
- Writes environment files for SSR runtime access

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
   - ❌ **DO NOT** use Amplify Console Secrets - they create wrong paths
   - ✅ Verify SSM parameters exist at exact path: `/amplify/dawq158evhzhz/{branch}/PPLX`
   - ✅ Check build logs for "secrets env var present: YES"
   - ✅ Look for "Parsed PPLX length: X" in build logs

2. **Empty `secrets` environment variable**
   - ❌ Most likely using wrong SSM paths (branch hash suffixes)
   - ✅ Recreate SSM parameters at exact paths: `/amplify/dawq158evhzhz/{branch}/`
   - ✅ Verify app ID and branch name are correct
   - ✅ Check AWS region matches your Amplify app

3. **Secrets not parsed correctly**
   - Check build logs for JSON parsing errors
   - Verify SSM parameter values don't contain invalid JSON characters
   - Ensure parameter type is "SecureString"

4. **Local development issues**
   - Use `npx ampx sandbox secret set PPLX` for local secrets
   - Alternatively, ensure `.env.local` exists and contains the PPLX variable
   - Restart your development server after adding secrets/environment variables

### Debugging Steps

1. **Check build logs** for secrets parsing:
   ```
   === AWS Amplify Secrets Parsing ===
   secrets env var present: YES
   secrets JSON length: 156
   Found secrets JSON, parsing individual secrets...
   Parsed PPLX length: 45
   ```

2. **Verify SSM parameters** exist at correct paths:
   ```bash
   aws ssm get-parameters-by-path --path "/amplify/dawq158evhzhz/main-convex-refactor" --recursive
   ```

3. **Test individual parameter** access:
   ```bash
   aws ssm get-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX" --with-decryption
   ```

4. **Verify runtime access** in API routes:
   ```typescript
   console.log("PPLX secret exists:", !!secret("PPLX"));
   ```

## Related Files

### Core Implementation
- `amplify.yml` - Enhanced build specification with secrets JSON parsing
- `app/api/chat/route.ts` - API route that uses the PPLX key with `secret()` function

### Setup Scripts
- `scripts/setup-ssm-secrets.sh` - Interactive SSM parameter setup (Linux/Mac)
- `scripts/setup-ssm-secrets.bat` - Command reference for Windows
- `scripts/SSM_COMMANDS.md` - Copy-paste AWS CLI commands

### Configuration
- `.env.local` - Local development environment
- `.env.local.example` - Template for environment variables
- `lib/env/schema.ts` - Environment variable validation schemas

### Components
- `components/ChatbotFab.tsx` - Chat interface component
- `components/InteractiveMap.tsx` - Map component using Google Maps API key
- `components/MapView.tsx` - Map view component

## References

- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Forum Solution Reference](https://forums.aws.amazon.com/) - Manual SSM parameter discovery

## Summary

The **key insight** from the forum solution is that Amplify Console Secrets create SSM parameters with branch hash suffixes that Amplify's auto-injection ignores. **Manual SSM parameters at exact paths** `/amplify/{app-id}/{branch}/SECRET_NAME` are required for the `secrets` JSON environment variable to be populated correctly.





