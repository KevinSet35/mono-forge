#!/bin/bash

# Create the project root directory and navigate to it
create_root_directory() {
    echo "📁 Creating project root directory: $PROJECT_NAME"
    
    # Create the project root directory
    mkdir "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    
    # Create the packages directory structure
    mkdir -p packages/client packages/server
    
    echo "✅ Root directory structure created"
}