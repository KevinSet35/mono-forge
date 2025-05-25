#!/bin/bash

# Install root dependencies for managing the monorepo
install_root_dependencies() {
    echo "📦 Installing root dependencies..."
    
    # Install root dependencies for managing the monorepo
    npm install --save-dev concurrently rimraf > /dev/null 2>&1
    
    echo "✅ Root dependencies installed"
}