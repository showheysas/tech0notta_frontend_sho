#!/bin/bash

# Azure App Service deployment script for Next.js standalone
set -e

echo "=== Starting deployment ==="

# Navigate to deployment source
cd "$DEPLOYMENT_SOURCE"

# Install dependencies
echo "Installing dependencies..."
npm ci --production=false

# Build Next.js application
echo "Building Next.js application..."
npm run build

# Copy standalone output to deployment target
echo "Copying standalone build to deployment target..."
cp -r .next/standalone/* "$DEPLOYMENT_TARGET/"
cp -r .next/static "$DEPLOYMENT_TARGET/.next/static"
cp -r public "$DEPLOYMENT_TARGET/public" 2>/dev/null || true

echo "=== Deployment complete ==="
