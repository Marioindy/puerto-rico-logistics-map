# AWS SSM Parameter Setup Commands

> **Critical Discovery**: Based on the AWS forum solution, Amplify only fetches secrets from exact paths `/amplify/{app-id}/{branch}/` - NOT the branch hash suffix paths that Amplify Console creates.

## App Configuration
- **App ID**: `dawq158evhzhz`
- **Current Branch**: `main-convex-refactor`
- **Production Branch**: `main`

## Quick Setup Commands

### For current branch (main-convex-refactor):
```bash
# Critical: PPLX (Perplexity API key)
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX" \
  --value "your_perplexity_api_key" \
  --type "SecureString" \
  --overwrite

# Google Maps API key
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main-convex-refactor/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  --value "your_google_maps_api_key" \
  --type "SecureString" \
  --overwrite
```

### For production branch (main):
```bash
# Critical: PPLX (Perplexity API key)
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main/PPLX" \
  --value "your_perplexity_api_key" \
  --type "SecureString" \
  --overwrite

# Google Maps API key
aws ssm put-parameter \
  --name "/amplify/dawq158evhzhz/main/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  --value "your_google_maps_api_key" \
  --type "SecureString" \
  --overwrite
```

### Optional: Convex secrets (if using Convex)
```bash
# For main-convex-refactor branch
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/CONVEX_DEPLOYMENT" --value "your_convex_deployment_id" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/CONVEX_DEPLOY_KEY" --value "your_convex_deploy_key" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/CONVEX_URL" --value "your_convex_url" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/NEXT_PUBLIC_CONVEX_URL" --value "your_public_convex_url" --type "SecureString" --overwrite

# For main branch
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main/CONVEX_DEPLOYMENT" --value "your_convex_deployment_id" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main/CONVEX_DEPLOY_KEY" --value "your_convex_deploy_key" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main/CONVEX_URL" --value "your_convex_url" --type "SecureString" --overwrite
aws ssm put-parameter --name "/amplify/dawq158evhzhz/main/NEXT_PUBLIC_CONVEX_URL" --value "your_public_convex_url" --type "SecureString" --overwrite
```

## Verification Commands

### List all parameters for a branch:
```bash
# Current branch
aws ssm get-parameters-by-path --path "/amplify/dawq158evhzhz/main-convex-refactor" --recursive

# Production branch
aws ssm get-parameters-by-path --path "/amplify/dawq158evhzhz/main" --recursive
```

### Get specific parameter:
```bash
# Get PPLX parameter (with decryption)
aws ssm get-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX" --with-decryption
aws ssm get-parameter --name "/amplify/dawq158evhzhz/main/PPLX" --with-decryption
```

### Delete parameter (if needed):
```bash
aws ssm delete-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX"
```

## Key Points from Forum Solution

1. **❌ Don't use Amplify Console Secrets**: They create parameters with branch hash suffixes like `/amplify/app-id/develop-branch-abc123/SECRET_NAME` that Amplify's auto-injection ignores.

2. **✅ Use manual SSM parameters**: Create at exact path `/amplify/{app-id}/{branch}/SECRET_NAME` - Amplify auto-injection works with these.

3. **🔍 Amplify looks for**: Parameters at exact path `/amplify/dawq158evhzhz/{branch}/` and provides them as `secrets` JSON variable.

4. **📝 Enhanced amplify.yml**: Already implemented to parse the `secrets` JSON and extract individual variables.

## Testing

After creating the parameters:

1. Deploy your Amplify app
2. Check build logs for successful secrets parsing
3. Look for log messages like "Found secrets JSON, parsing..." and "Parsed PPLX length: X"
4. Verify your chat API works (tests PPLX secret)
5. Verify maps render correctly (tests Google Maps API key)

## Troubleshooting

- If secrets aren't found, verify the exact path matches: `/amplify/dawq158evhzhz/{branch}/SECRET_NAME`
- Check AWS region matches your Amplify app's region
- Ensure your AWS credentials have SSM permissions
- Look for `secrets` environment variable in build logs: should show JSON content, not empty