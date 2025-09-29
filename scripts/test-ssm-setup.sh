#!/bin/bash

# Test SSM Parameter Setup
# Validates that SSM parameters are created correctly for AWS Amplify Secrets
#
# Usage: ./test-ssm-setup.sh [branch-name]

set -e

# Configuration
APP_ID="dawq158evhzhz"
BRANCH="${1:-main-convex-refactor}"  # Default to current branch, allow override
AWS_REGION="${AWS_REGION:-us-east-1}"

echo "=== Testing SSM Parameter Setup ==="
echo "App ID: $APP_ID"
echo "Branch: $BRANCH"
echo "Region: $AWS_REGION"
echo ""

# SSM Parameter path for this branch
SSM_PATH="/amplify/$APP_ID/$BRANCH"

echo "Testing parameters at path: $SSM_PATH"
echo ""

# Function to test parameter
test_parameter() {
    local param_name="$1"
    local description="$2"
    local full_path="$SSM_PATH/$param_name"

    echo -n "Testing $param_name... "

    # Try to get the parameter
    result=$(aws ssm get-parameter --region "$AWS_REGION" --name "$full_path" --with-decryption 2>/dev/null || echo "NOT_FOUND")

    if [ "$result" = "NOT_FOUND" ]; then
        echo "❌ MISSING"
        echo "  Parameter not found at: $full_path"
        echo "  Create with: aws ssm put-parameter --name \"$full_path\" --value \"your_value\" --type \"SecureString\""
        return 1
    else
        # Extract value length
        value=$(echo "$result" | jq -r '.Parameter.Value' 2>/dev/null || echo "")
        if [ -n "$value" ]; then
            echo "✅ FOUND (length: ${#value})"
            return 0
        else
            echo "❌ INVALID (could not parse value)"
            return 1
        fi
    fi
}

# Test all required parameters
echo "Testing required parameters:"
test_parameter "PPLX" "Perplexity API key for chat functionality"

echo ""
echo "Testing optional parameters:"
test_parameter "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "Google Maps API key for map rendering" || echo "  (Optional - maps will show placeholder)"
test_parameter "CONVEX_DEPLOYMENT" "Convex deployment ID" || echo "  (Optional - only needed if using Convex)"
test_parameter "CONVEX_DEPLOY_KEY" "Convex deployment key" || echo "  (Optional - only needed if using Convex)"
test_parameter "CONVEX_URL" "Convex backend URL" || echo "  (Optional - only needed if using Convex)"
test_parameter "NEXT_PUBLIC_CONVEX_URL" "Public Convex URL for client" || echo "  (Optional - only needed if using Convex)"

echo ""
echo "=== Simulating Amplify Secrets JSON ==="

# Simulate what Amplify would provide
echo "Fetching all parameters and creating secrets JSON..."

# Get all parameters for this path
params_json=$(aws ssm get-parameters-by-path --region "$AWS_REGION" --path "$SSM_PATH" --recursive --with-decryption 2>/dev/null || echo '{"Parameters":[]}')

# Build secrets JSON like Amplify does
secrets_json="{"
first=true

echo "$params_json" | jq -r '.Parameters[] | "\(.Name)=\(.Value)"' | while IFS='=' read -r name value; do
    # Extract just the parameter name (last part after /)
    param_name=$(basename "$name")

    if [ "$first" = true ]; then
        secrets_json="$secrets_json\"$param_name\":\"$value\""
        first=false
    else
        secrets_json="$secrets_json,\"$param_name\":\"$value\""
    fi
done

secrets_json="$secrets_json}"

echo "Simulated secrets JSON structure:"
echo "$secrets_json" | jq -r 'to_entries[] | "  \(.key): \(.value | length) characters"' 2>/dev/null || echo "  (Could not parse as JSON)"

echo ""
echo "=== Test Summary ==="

# Count parameters
param_count=$(aws ssm get-parameters-by-path --region "$AWS_REGION" --path "$SSM_PATH" --recursive 2>/dev/null | jq '.Parameters | length' 2>/dev/null || echo "0")

if [ "$param_count" -gt 0 ]; then
    echo "✅ Found $param_count parameter(s) at correct path"
    echo "✅ Amplify should be able to fetch these parameters"
    echo "✅ Your enhanced amplify.yml should parse them correctly"
else
    echo "❌ No parameters found at path: $SSM_PATH"
    echo "❌ Amplify will have empty secrets JSON"
    echo "❌ Build will likely fail or features will not work"
fi

echo ""
echo "Next steps:"
echo "1. Fix any missing parameters shown above"
echo "2. Deploy your Amplify app to test in real environment"
echo "3. Check build logs for successful secrets parsing"
echo "4. Verify your application features work correctly"