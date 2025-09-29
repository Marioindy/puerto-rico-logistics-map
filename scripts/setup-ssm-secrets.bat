@echo off
REM AWS Amplify SSM Secrets Setup Script (Windows)
REM Based on the forum solution that discovered Amplify's secret injection requirements
REM
REM CRITICAL: Amplify only fetches secrets from exact paths /amplify/{app-id}/{branch}/
REM NOT from the branch hash suffix paths that Amplify Console creates
REM
REM App ID: dawq158evhzhz
REM Usage: setup-ssm-secrets.bat [branch-name]

setlocal enabledelayedexpansion

REM Configuration
set APP_ID=dawq158evhzhz
set BRANCH=%1
if "%BRANCH%"=="" set BRANCH=main
if "%AWS_REGION%"=="" set AWS_REGION=us-east-1

echo === AWS Amplify SSM Secrets Setup ===
echo App ID: %APP_ID%
echo Branch: %BRANCH%
echo Region: %AWS_REGION%
echo.

REM SSM Parameter path for this branch
set SSM_PATH=/amplify/%APP_ID%/%BRANCH%

echo Creating SSM parameters at path: %SSM_PATH%
echo.

echo IMPORTANT: You'll need to run these AWS CLI commands manually:
echo.

echo # Create PPLX (Perplexity API key) - REQUIRED
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/PPLX" --value "your_perplexity_api_key" --type "SecureString" --overwrite
echo.

echo # Create Google Maps API key
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" --value "your_google_maps_api_key" --type "SecureString" --overwrite
echo.

echo # Optional: Create Convex secrets (if using Convex)
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/CONVEX_DEPLOYMENT" --value "your_convex_deployment_id" --type "SecureString" --overwrite
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/CONVEX_DEPLOY_KEY" --value "your_convex_deploy_key" --type "SecureString" --overwrite
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/CONVEX_URL" --value "your_convex_url" --type "SecureString" --overwrite
echo aws ssm put-parameter --region %AWS_REGION% --name "%SSM_PATH%/NEXT_PUBLIC_CONVEX_URL" --value "your_public_convex_url" --type "SecureString" --overwrite
echo.

echo === Verification Commands ===
echo.
echo # List all parameters for this app/branch:
echo aws ssm get-parameters-by-path --region %AWS_REGION% --path "%SSM_PATH%" --recursive
echo.
echo # Get specific parameter:
echo aws ssm get-parameter --region %AWS_REGION% --name "%SSM_PATH%/PPLX" --with-decryption
echo.

echo === Important Notes ===
echo 1. Replace placeholder values with your actual API keys
echo 2. Do NOT use Amplify Console Secrets - they create wrong paths!
echo 3. Amplify only looks for parameters at exact path: %SSM_PATH%/
echo 4. After creating parameters, deploy your Amplify app to test
echo.

pause