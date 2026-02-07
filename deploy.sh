#!/bin/bash

# Azure App Service deployment script for Next.js standalone
set -e

echo "=== Starting deployment ==="

# Navigate to deployment source
cd "$DEPLOYMENT_SOURCE"

# Copy pre-built standalone output to deployment target
echo "Copying standalone build to deployment target..."

# Check if standalone build exists
if [ -d ".next/standalone" ]; then
    cp -r .next/standalone/* "$DEPLOYMENT_TARGET/"
    cp -r .next/static "$DEPLOYMENT_TARGET/.next/static"
    cp -r public "$DEPLOYMENT_TARGET/public" 2>/dev/null || true
    echo "=== Deployment complete (pre-built) ==="
else
    echo "Error: .next/standalone not found. Build must be done in CI."
    exit 1
fi
