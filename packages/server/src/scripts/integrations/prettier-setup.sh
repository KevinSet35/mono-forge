#!/bin/bash

setup_prettier() {
    echo "💅 Setting up Prettier configuration..."
    
    # Install Prettier
    npm install --save-dev prettier
    
    # Create comprehensive .prettierrc configuration
    cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "insertPragma": false,
  "requirePragma": false,
  "proseWrap": "preserve",
  "vueIndentScriptAndStyle": false,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "printWidth": 80
      }
    },
    {
      "files": "*.json",
      "options": {
        "printWidth": 120,
        "tabWidth": 2
      }
    },
    {
      "files": "*.yml",
      "options": {
        "tabWidth": 2,
        "singleQuote": false
      }
    },
    {
      "files": "*.yaml",
      "options": {
        "tabWidth": 2,
        "singleQuote": false
      }
    }
  ]
}
EOF

    # Create .prettierignore file
    cat > .prettierignore << 'EOF'
# Dependencies
node_modules/

# Production builds
dist/
build/
packages/*/dist/
packages/*/build/

# Coverage reports
coverage/
.nyc_output/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Generated files
*.d.ts

# Package managers
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Documentation build
docs/build/

# Storybook build
storybook-static/

# Docker files
Dockerfile*
docker-compose*.yml

# Git files
.gitignore
.gitattributes

# CI/CD files
.github/
.travis.yml
.circleci/

# Database files
*.sqlite
*.db

# Cache directories
.cache/
.parcel-cache/

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env.test

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# Next.js build output
.next/

# Nuxt.js build / generate output
.nuxt/

# Gatsby files
.cache/
public/

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
EOF

    # Add Prettier scripts to package.json
    npm pkg set scripts.format="prettier --write ."
    npm pkg set scripts.format:check="prettier --check ."
    npm pkg set scripts.format:client="prettier --write packages/client/src"
    npm pkg set scripts.format:server="prettier --write packages/server/src"
    npm pkg set scripts.format:types="prettier --write packages/types/src"

    # Create Prettier configuration for each package
    cd packages/client
    cat > .prettierrc << 'EOF'
{
  "extends": "../../.prettierrc",
  "overrides": [
    {
      "files": "*.{ts,tsx}",
      "options": {
        "jsxSingleQuote": true,
        "jsxBracketSameLine": false
      }
    }
  ]
}
EOF

    cd ../server
    cat > .prettierrc << 'EOF'
{
  "extends": "../../.prettierrc",
  "overrides": [
    {
      "files": "*.ts",
      "options": {
        "printWidth": 120
      }
    }
  ]
}
EOF

    cd ../types
    cat > .prettierrc << 'EOF'
{
  "extends": "../../.prettierrc",
  "overrides": [
    {
      "files": "*.ts",
      "options": {
        "printWidth": 90
      }
    }
  ]
}
EOF

    cd ../..

    # Create Prettier helper scripts
    mkdir -p scripts
    cat > scripts/format-check.sh << 'EOF'
#!/bin/bash
echo "💅 Checking code formatting with Prettier..."

echo "📝 Checking client formatting..."
cd packages/client
npx prettier --check src/

echo "📝 Checking server formatting..."
cd ../server
npx prettier --check src/

echo "📝 Checking types formatting..."
cd ../types
npx prettier --check src/

echo "📝 Checking root files..."
cd ../..
npx prettier --check "*.{js,json,md,yml,yaml}" "scripts/**/*.sh"

echo "✅ Prettier format check completed"
EOF

    cat > scripts/format-fix.sh << 'EOF'
#!/bin/bash
echo "💅 Formatting code with Prettier..."

echo "📝 Formatting client code..."
cd packages/client
npx prettier --write src/

echo "📝 Formatting server code..."
cd ../server
npx prettier --write src/

echo "📝 Formatting types code..."
cd ../types
npx prettier --write src/

echo "📝 Formatting root files..."
cd ../..
npx prettier --write "*.{js,json,md,yml,yaml}" "scripts/**/*.sh"

echo "✅ Code formatting completed"
EOF

    chmod +x scripts/format-*.sh

    # Create EditorConfig file for consistent formatting
    cat > .editorconfig << 'EOF'
# EditorConfig is awesome: https://EditorConfig.org

# top-most EditorConfig file
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8

# 2 space indentation for most files
[*.{js,jsx,ts,tsx,json,css,scss,html,yml,yaml,md}]
indent_style = space
indent_size = 2

# 4 space indentation for Python files
[*.py]
indent_style = space
indent_size = 4

# Tab indentation for Makefiles
[Makefile]
indent_style = tab

# No trailing whitespace for markdown files
[*.md]
trim_trailing_whitespace = false

# Specific settings for package.json
[package.json]
indent_size = 2

# Specific settings for shell scripts
[*.sh]
indent_style = space
indent_size = 2
EOF

    # Update VS Code settings to include Prettier
    if [ -f .vscode/settings.json ]; then
        # Backup existing settings
        cp .vscode/settings.json .vscode/settings.json.backup
        
        # Merge Prettier settings with existing ESLint settings
        cat > .vscode/settings.json << 'EOF'
{
  "eslint.workingDirectories": [
    "packages/client",
    "packages/server",
    "packages/types"
  ],
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": "./.prettierrc",
  "prettier.ignorePath": "./.prettierignore",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },
  "[yaml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[yml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.associations": {
    "*.json": "jsonc"
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
EOF
    else
        mkdir -p .vscode
        cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": "./.prettierrc",
  "prettier.ignorePath": "./.prettierignore",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
EOF
    fi

    # Create pre-commit hook suggestion
    cat > scripts/install-hooks.sh << 'EOF'
#!/bin/bash
echo "🔗 Installing Git pre-commit hooks..."

# Install husky if not already installed
if ! npm list husky > /dev/null 2>&1; then
    echo "📦 Installing husky..."
    npm install --save-dev husky
fi

# Install lint-staged if not already installed
if ! npm list lint-staged > /dev/null 2>&1; then
    echo "📦 Installing lint-staged..."
    npm install --save-dev lint-staged
fi

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

echo "✅ Git hooks installed"
echo "📝 Now your code will be automatically formatted and linted before commits"
EOF

    chmod +x scripts/install-hooks.sh

    echo "✅ Prettier configuration setup complete"
    echo "📝 Features added:"
    echo "   - Comprehensive Prettier configuration with overrides"
    echo "   - Package-specific Prettier configs"
    echo "   - EditorConfig for consistent formatting across editors"
    echo "   - VS Code settings for automatic formatting"
    echo "   - Format checking and fixing scripts"
    echo "   - Pre-commit hook setup (optional)"
    echo ""
    echo "📝 Available commands:"
    echo "   - npm run format: Format all files"
    echo "   - npm run format:check: Check formatting without fixing"
    echo "   - npm run format:client: Format client files only"
    echo "   - npm run format:server: Format server files only"
    echo "   - npm run format:types: Format types files only"
    echo "   - ./scripts/format-check.sh: Comprehensive format check"
    echo "   - ./scripts/format-fix.sh: Comprehensive format fix"
    echo "   - ./scripts/install-hooks.sh: Install pre-commit hooks (optional)"
}