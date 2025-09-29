# Amplify Secrets Setup Scripts

This directory contains scripts to implement the AWS Amplify Secrets solution based on the forum discovery that manual SSM parameters are required.

## 🔍 The Problem

Amplify Console Secrets create SSM parameters with branch hash suffixes (e.g., `/amplify/app-id/branch-abc123/SECRET_NAME`) that Amplify's auto-injection ignores. Manual SSM parameters at exact paths are required.

## 📁 Scripts Overview

### Setup Scripts

#### `setup-ssm-secrets.sh` (Linux/Mac)
Interactive script that prompts for secret values and creates SSM parameters at correct paths.

**Usage:**
```bash
# For current branch (main-convex-refactor)
./setup-ssm-secrets.sh main-convex-refactor

# For production branch
./setup-ssm-secrets.sh main
```

**Features:**
- Interactive secret input (hidden from terminal)
- Validates empty values
- Creates parameters with proper descriptions
- Provides verification commands

#### `setup-ssm-secrets.bat` (Windows)
Displays AWS CLI commands for manual execution on Windows systems.

**Usage:**
```cmd
setup-ssm-secrets.bat main-convex-refactor
```

**Features:**
- Shows exact AWS CLI commands to run
- Includes parameter paths for both branches
- Provides verification commands

### Reference & Testing

#### `SSM_COMMANDS.md`
Quick reference with copy-paste AWS CLI commands for both branches.

**Contents:**
- Exact commands for current branch (`main-convex-refactor`)
- Exact commands for production branch (`main`)
- Verification commands
- Troubleshooting tips

#### `test-ssm-setup.sh`
Validates that SSM parameters are created correctly and simulates Amplify's secrets JSON.

**Usage:**
```bash
./test-ssm-setup.sh main-convex-refactor
```

**Features:**
- Tests each parameter exists and has a value
- Shows parameter lengths for validation
- Simulates the secrets JSON that Amplify creates
- Provides summary and next steps

## 🚀 Quick Start

1. **Choose your method:**
   - **Linux/Mac**: Use `setup-ssm-secrets.sh` for interactive setup
   - **Windows**: Use `setup-ssm-secrets.bat` for command reference
   - **Any platform**: Copy commands from `SSM_COMMANDS.md`

2. **Set up parameters:**
   ```bash
   # Interactive setup (Linux/Mac)
   ./setup-ssm-secrets.sh main-convex-refactor

   # Or use manual commands from SSM_COMMANDS.md
   ```

3. **Test the setup:**
   ```bash
   ./test-ssm-setup.sh main-convex-refactor
   ```

4. **Deploy and verify:**
   - Deploy your Amplify app
   - Check build logs for successful secrets parsing
   - Test application features

## 📋 Required Secrets

### Critical (Required)
- **PPLX**: Perplexity API key for chat functionality

### Optional
- **NEXT_PUBLIC_GOOGLE_MAPS_API_KEY**: Google Maps API key for map rendering
- **CONVEX_DEPLOYMENT**: Convex deployment ID (if using Convex)
- **CONVEX_DEPLOY_KEY**: Convex deployment key (if using Convex)
- **CONVEX_URL**: Convex backend URL (if using Convex)
- **NEXT_PUBLIC_CONVEX_URL**: Public Convex URL for client (if using Convex)

## 🛠 Configuration

### App Configuration
- **App ID**: `dawq158evhzhz`
- **Current Branch**: `main-convex-refactor`
- **Production Branch**: `main`

### SSM Paths
- Current branch: `/amplify/dawq158evhzhz/main-convex-refactor/SECRET_NAME`
- Production branch: `/amplify/dawq158evhzhz/main/SECRET_NAME`

## 📖 How It Works

1. **Manual SSM Creation**: Scripts create parameters at exact paths Amplify expects
2. **Amplify Auto-Injection**: Amplify fetches parameters and provides as `secrets` JSON variable
3. **Enhanced amplify.yml**: Parses the JSON and extracts individual secrets
4. **Runtime Access**: Secrets available via `secret()` function and environment variables

## 🔧 Troubleshooting

### Parameter Not Found
```bash
# Verify parameter exists
aws ssm get-parameter --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX" --with-decryption

# List all parameters for branch
aws ssm get-parameters-by-path --path "/amplify/dawq158evhzhz/main-convex-refactor" --recursive
```

### Wrong AWS Region
```bash
# Set correct region
export AWS_REGION=us-east-1  # or your Amplify app's region

# Test with explicit region
aws ssm get-parameter --region us-east-1 --name "/amplify/dawq158evhzhz/main-convex-refactor/PPLX"
```

### Build Logs Show Empty Secrets
- Verify SSM parameters are at exact paths (no branch hash suffixes)
- Check AWS region matches your Amplify app
- Ensure parameter type is "SecureString"
- Verify app ID and branch name are correct

## 🎯 Key Insights

1. **❌ Amplify Console Secrets don't work**: They create wrong SSM paths
2. **✅ Manual SSM parameters work**: At exact paths `/amplify/{app-id}/{branch}/`
3. **🔄 Amplify provides JSON**: Single `secrets` variable with all parameters
4. **🎉 Enhanced parsing**: Our `amplify.yml` extracts individual secrets from JSON