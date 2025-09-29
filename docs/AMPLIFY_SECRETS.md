# AWS Amplify Environment Variables Guide

## Overview

This document outlines how to manage environment variables in AWS Amplify for the Puerto Rico Logistics Map application. All API keys and configuration will be handled through standard AWS Amplify environment variables.

## Setup Instructions

### 1. AWS Amplify Console Setup

1. Navigate to your Amplify app in AWS Console
2. Go to **Hosting** → **Environment variables**
3. Add the following environment variables:

#### Required Variables
- **PPLX**: `your_perplexity_api_key`
  - Perplexity API key for chat functionality

#### Optional Variables
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: `your_google_maps_api_key`
  - Google Maps API key for map rendering
- **CONVEX_DEPLOYMENT**: `your_convex_deployment_id`
- **CONVEX_DEPLOY_KEY**: `your_convex_deploy_key`
- **CONVEX_URL**: `your_convex_url`
- **NEXT_PUBLIC_CONVEX_URL**: `your_public_convex_url`

### 2. Build Specification

The `amplify.yml` is simplified:

```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - corepack enable pnpm
            - pnpm install --frozen-lockfile
        build:
          commands:
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

For local development, create a `.env.local` file:

```bash
# Server-side variables (never exposed to browser)
PPLX=your_local_perplexity_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional: Convex variables if using
CONVEX_DEPLOYMENT=your_convex_deployment_id
CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_URL=your_public_convex_url
```

**Important**: Never commit the actual `.env.local` file to version control.

## Security Best Practices

1. **Use environment variables for configuration** - Simple and straightforward
2. **Use least privilege access** - Ensure your Amplify app has minimal required permissions
3. **Rotate API keys regularly** - Update both local and Amplify console values
4. **Monitor usage** - Track API usage to detect unauthorized access

## Code Implementation

API routes simply use `process.env` to access environment variables:

```typescript
import { NextResponse } from "next/server";

const MIN_PPLX_KEY_LENGTH = 10;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.PPLX?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API configuration error",
          message: "Chat service is not properly configured (missing PPLX environment variable)"
        },
        { status: 500 }
      );
    }

    if (apiKey.length < MIN_PPLX_KEY_LENGTH) {
      return NextResponse.json(
        {
          error: "API configuration error",
          message: "Chat service configuration is invalid (PPLX key is malformed)"
        },
        { status: 500 }
      );
    }

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
   - Verify the environment variable is set in Amplify Console under **Hosting** → **Environment variables**
   - Ensure the variable name is exactly `PPLX` (case-sensitive)
   - Check that the value is not empty

2. **Environment variables not available**
   - Confirm variables are set in the correct branch
   - Redeploy your Amplify app after adding environment variables
   - Check build logs for any environment variable errors

3. **Local development issues**
   - Ensure `.env.local` exists and contains the required variables
   - Restart your development server after adding environment variables
   - Verify variable names match exactly between local and Amplify

### Debugging Steps

1. **Check Amplify Console**:
   - Go to **Hosting** → **Environment variables**
   - Verify all required variables are set
   - Check the correct branch is selected

2. **Verify local environment**:
   ```bash
   # Check if .env.local exists and has correct variables
   cat .env.local
   ```

3. **Test API routes**:
   ```typescript
   console.log("PPLX exists:", !!process.env.PPLX);
   ```

## Related Files

### Core Implementation
- `amplify.yml` - Simple build specification
- `app/api/chat/route.ts` - API route that uses environment variables

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
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Summary

Use standard AWS Amplify environment variables for all API keys and configuration. Set them in the Amplify Console under **Hosting** → **Environment variables** and access them via `process.env` in your code.





