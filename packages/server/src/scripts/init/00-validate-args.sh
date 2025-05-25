#!/bin/bash

validate_arguments() {

    # Use pre-configured name if available, otherwise use command line argument

    if [ -n "$PRECONFIGURED_PROJECT_NAME" ]; then

        PROJECT_NAME="$PRECONFIGURED_PROJECT_NAME"

        echo "📝 Using pre-configured project name: $PROJECT_NAME"

    else

        PROJECT_NAME=$1

        

        # Exit if no project name is provided

        if [ -z "$PROJECT_NAME" ]; then

            echo "❌ Error: Please provide a project name as an argument"

            echo "Usage: ./setup-project.sh <project-name>"

            exit 1

        fi

        

        echo "📝 Validated project name: $PROJECT_NAME"

    fi
}