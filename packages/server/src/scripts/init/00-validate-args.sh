#!/bin/bash

# Validate command line arguments
validate_arguments() {
    PROJECT_NAME=$1
    
    # Exit if no project name is provided
    if [ -z "$PROJECT_NAME" ]; then
        echo "❌ Error: Please provide a project name as an argument"
        echo "Usage: ./setup-project.sh <project-name>"
        exit 1
    fi
    
    echo "📝 Validated project name: $PROJECT_NAME"
    export PROJECT_NAME
}