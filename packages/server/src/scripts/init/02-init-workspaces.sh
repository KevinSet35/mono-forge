#!/bin/bash

# Initialize the root package.json with workspaces configuration
init_workspaces() {
    echo "⚙️ Initializing workspace configuration..."
    
    # Initialize the root package.json with workspaces
    npm init -y > /dev/null 2>&1
    
    # Edit package.json to add workspaces configuration and scripts
    cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "A flexible monorepo template for multi-language projects",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "npm run dev --workspace=@$PROJECT_NAME/client",
    "dev:server": "npm run dev --workspace=@$PROJECT_NAME/server",
    "build": "npm run build:client && npm run build:server",
    "build:client": "npm run build --workspace=@$PROJECT_NAME/client",
    "build:server": "npm run build --workspace=@$PROJECT_NAME/server",
    "start": "npm run start --workspace=@$PROJECT_NAME/server",
    "start:client": "npm run start --workspace=@$PROJECT_NAME/client",
    "start:server": "npm run start --workspace=@$PROJECT_NAME/server",
    "lint": "npm run lint --workspaces",
    "test": "npm run test --workspaces",
    "clean": "rimraf packages/*/dist packages/*/build"
  },
  "keywords": [
    "monorepo",
    "template",
    "workspace",
    "polyglot"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2",
    "rimraf": "^5.0.5"
  }
}
EOF
    
    echo "✅ Workspace configuration initialized"
}