#!/bin/bash

# Create configuration files (.gitignore and .prettierrc)
create_config_files() {
    echo "⚙️ Creating configuration files..."
    
    create_gitignore
    create_prettierrc
    
    echo "✅ Configuration files created"
}

create_gitignore() {
    # .gitignore
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/build
/dist
/packages/*/build
/packages/*/dist

# Testing
/coverage

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store
EOF
}

create_prettierrc() {
    # .prettierrc
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF
}