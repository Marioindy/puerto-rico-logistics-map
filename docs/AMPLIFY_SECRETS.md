# AWS Amplify Environment Variables Guide

## Overview

This document outlines how to manage environment variables in AWS Amplify for the Puerto Rico Logistics Map application. All API keys and configuration will be handled through standard AWS Amplify environment variables.

## Setup Instructions

### 1. AWS Amplify Console Setup

1. Navigate to your Amplify app in AWS Console
2. Go to **Hosting** → **Environment variables**
3. Add the following environment variables:

#### Required Variables
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
# Google Maps API key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Convex variables
CONVEX_DEPLOYMENT=your_convex_deployment_id
CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_URL=your_public_convex_url
ADMIN_SECRET_KEY=your_admin_secret_key
```

**Important**: Never commit the actual `.env.local` file to version control.

## Security Best Practices

1. **Use environment variables for configuration** - Simple and straightforward
2. **Use least privilege access** - Ensure your Amplify app has minimal required permissions
3. **Rotate API keys regularly** - Update both local and Amplify console values
4. **Monitor usage** - Track API usage to detect unauthorized access

## Troubleshooting

### Common Issues

1. **Environment variables not available**
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

## Related Files

### Core Implementation
- `amplify.yml` - Simple build specification
- `convex/` - Convex backend with admin mutations

### Configuration
- `.env.local` - Local development environment
- `.env.local.example` - Template for environment variables
- `lib/env/schema.ts` - Environment variable validation schemas

### Components
- `components/InteractiveMap.tsx` - Map component using Google Maps API key
- `components/MapView.tsx` - Map view component

## References

- [AWS Amplify Environment Variables](https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Summary

Use standard AWS Amplify environment variables for all API keys and configuration. Set them in the Amplify Console under **Hosting** → **Environment variables** and access them via `process.env` in your code.





