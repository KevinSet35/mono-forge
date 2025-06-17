#!/bin/bash

setup_eslint() {
    echo "🔍 Setting up ESLint configuration..."
    
    # Install ESLint dependencies at root
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier
    
    # Create root ESLint configuration
    cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./packages/*/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    
    // General rules
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    
    // Code style
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single'],
    'indent': ['error', 2],
  },
  overrides: [
    {
      // Client-specific configuration
      files: ['packages/client/**/*.{ts,tsx}'],
      env: {
        browser: true,
        es6: true,
      },
      extends: [
        'react-app',
        'react-app/jest',
        '@typescript-eslint/recommended',
        'prettier',
      ],
      plugins: ['react', 'react-hooks', '@typescript-eslint'],
      rules: {
        // React specific rules
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',
        
        // TypeScript React rules
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    {
      // Server-specific configuration
      files: ['packages/server/**/*.ts'],
      env: {
        node: true,
        jest: true,
      },
      extends: [
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'prettier',
      ],
      rules: {
        // NestJS specific rules
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        
        // Allow console in server
        'no-console': 'off',
      },
    },
    {
      // Types package configuration
      files: ['packages/types/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        'no-console': 'error',
      },
    },
    {
      // Test files configuration
      files: ['**/*.{test,spec}.{ts,tsx}', '**/__tests__/**/*.{ts,tsx}'],
      env: {
        jest: true,
      },
      extends: ['@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.js',
    '!.eslintrc.js',
    '!jest.config.js',
  ],
};
EOF

    # Create .eslintignore file
    cat > .eslintignore << 'EOF'
# Dependencies
node_modules/

# Production builds
dist/
build/
packages/*/dist/
packages/*/build/

# Coverage
coverage/

# Generated files
*.d.ts

# Configuration files (except ESLint)
*.config.js
!.eslintrc.js

# Logs
*.log

# Environment files
.env*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF

    # Install additional ESLint dependencies for client
    cd packages/client
    npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
    
    cd ../server
    # Server already has most ESLint deps from NestJS
    npm install --save-dev eslint-plugin-jest
    
    cd ../..

    # Create ESLint scripts
    npm pkg set scripts.lint="eslint . --ext .ts,.tsx,.js,.jsx"
    npm pkg set scripts.lint:fix="eslint . --ext .ts,.tsx,.js,.jsx --fix"
    npm pkg set scripts.lint:client="eslint packages/client --ext .ts,.tsx"
    npm pkg set scripts.lint:server="eslint packages/server --ext .ts"
    npm pkg set scripts.lint:types="eslint packages/types --ext .ts"

    # Create lint-staged configuration for pre-commit hooks
    cat > .lintstagedrc.json << 'EOF'
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
EOF

    # Create VS Code settings for ESLint
    mkdir -p .vscode
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
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
EOF

    # Create ESLint helper script
    mkdir -p scripts
    cat > scripts/lint-check.sh << 'EOF'
#!/bin/bash
echo "🔍 Running ESLint checks..."

echo "📝 Linting client..."
cd packages/client
npx eslint . --ext .ts,.tsx

echo "📝 Linting server..."
cd ../server
npx eslint . --ext .ts

echo "📝 Linting types..."
cd ../types
npx eslint . --ext .ts

cd ../..
echo "✅ ESLint checks completed"
EOF

    cat > scripts/lint-fix.sh << 'EOF'
#!/bin/bash
echo "🔧 Running ESLint auto-fix..."

echo "📝 Fixing client code..."
cd packages/client
npx eslint . --ext .ts,.tsx --fix

echo "📝 Fixing server code..."
cd ../server
npx eslint . --ext .ts --fix

echo "📝 Fixing types code..."
cd ../types
npx eslint . --ext .ts --fix

cd ../..
echo "✅ ESLint auto-fix completed"
EOF

    chmod +x scripts/lint-*.sh

    echo "✅ ESLint configuration setup complete"
    echo "📝 Features added:"
    echo "   - Comprehensive ESLint rules for TypeScript"
    echo "   - Separate configurations for client, server, and types"
    echo "   - React and NestJS specific rules"
    echo "   - Integration with Prettier"
    echo "   - VS Code settings for automatic fixing"
    echo "   - Lint-staged configuration for pre-commit hooks"
    echo ""
    echo "📝 Available commands:"
    echo "   - npm run lint: Check all files"
    echo "   - npm run lint:fix: Auto-fix all files"
    echo "   - npm run lint:client: Check client files only"
    echo "   - npm run lint:server: Check server files only"
    echo "   - npm run lint:types: Check types files only"
    echo "   - ./scripts/lint-check.sh: Run comprehensive lint check"
    echo "   - ./scripts/lint-fix.sh: Run comprehensive auto-fix"
}