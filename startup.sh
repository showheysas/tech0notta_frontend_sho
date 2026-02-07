#!/bin/bash

# Azure App Service startup script for Next.js standalone
cd /home/site/wwwroot

# Set default port if not provided
export PORT=${PORT:-3000}

# Start Next.js standalone server
node .next/standalone/server.js
