#!/bin/bash

# AWS Amplify SSM Secrets Setup Script
# Based on the forum solution that discovered Amplify's secret injection requirements
#
# CRITICAL: Amplify only fetches secrets from exact paths /amplify/{app-id}/{branch}/
# NOT from the branch hash suffix paths that Amplify Console creates
#
# App ID: dawq158evhzhz
# Usage: ./setup-ssm-secrets.sh [branch-name]

set -e

# Configuration
APP_ID="dawq158evhzhz"
BRANCH="${1:-main}"  # Default to main branch, allow override
AWS_REGION="${AWS_REGION:-us-east-1}"  # Default to us-east-1, allow override

echo "=== AWS Amplify SSM Secrets Setup ==="
echo "App ID: $APP_ID"
echo "Branch: $BRANCH"
echo "Region: $AWS_REGION"
echo ""

# SSM Parameter path for this branch
SSM_PATH="/amplify/$APP_ID/$BRANCH"

echo "Creating SSM parameters at path: $SSM_PATH"
echo ""

# Function to create SSM parameter
create_secret() {
    local secret_name="$1"
    local description="$2"
    local param_name="$SSM_PATH/$secret_name"

    echo "Creating parameter: $param_name"
    echo "Description: $description"
    echo -n "Enter value for $secret_name: "
    read -s secret_value
    echo ""

    if [ -z "$secret_value" ]; then
        echo "❌ Empty value provided for $secret_name, skipping..."
        return 1
    fi

    # Create the parameter
    aws ssm put-parameter \
        --region "$AWS_REGION" \
        --name "$param_name" \
        --value "$secret_value" \
        --type "SecureString" \
        --description "$description" \
        --overwrite

    if [ $? -eq 0 ]; then
        echo "✅ Successfully created $param_name"
    else
        echo "❌ Failed to create $param_name"
        return 1
    fi
    echo ""
}

# Create all required secrets
echo "Creating secrets for Puerto Rico Logistics Map..."
echo ""

# Critical secret: PPLX (Perplexity API key)
create_secret "PPLX" "Perplexity API key for chat functionality"

# Google Maps API key (can be public but stored as secret for consistency)
create_secret "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "Google Maps API key for map rendering"

# Optional Convex secrets (if using Convex)
echo "Creating optional Convex secrets (press Enter to skip any you don't need):"
create_secret "CONVEX_DEPLOYMENT" "Convex deployment ID" || echo "Skipped CONVEX_DEPLOYMENT"
create_secret "CONVEX_DEPLOY_KEY" "Convex deployment key" || echo "Skipped CONVEX_DEPLOY_KEY"
create_secret "CONVEX_URL" "Convex backend URL" || echo "Skipped CONVEX_URL"
create_secret "NEXT_PUBLIC_CONVEX_URL" "Public Convex URL for client" || echo "Skipped NEXT_PUBLIC_CONVEX_URL"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Verify your parameters were created:"
echo "aws ssm get-parameters-by-path --region $AWS_REGION --path \"$SSM_PATH\" --recursive"
echo ""
echo "Next steps:"
echo "1. Deploy your Amplify app to test the secrets injection"
echo "2. Check build logs for successful secrets parsing"
echo "3. Verify your app can access the secrets at runtime"
echo ""
echo "⚠️  Important: Do NOT use Amplify Console Secrets - they create wrong paths!"
echo "🔍  Amplify only looks for parameters at exact path: $SSM_PATH/"