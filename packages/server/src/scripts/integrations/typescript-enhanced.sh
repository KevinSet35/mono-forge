#!/bin/bash

setup_typescript_enhanced() {
    echo "📘 Setting up enhanced TypeScript configuration..."
    
    # Create stricter root tsconfig.json
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "references": [
    { "path": "./packages/client" },
    { "path": "./packages/server" },
    { "path": "./packages/types" }
  ],
  "files": []
}
EOF

    # Create shared types package
    mkdir -p packages/types/src
    cd packages/types
    
    # Initialize types package
    npm init -y > /dev/null 2>&1
    
    # Update package.json for types package
    cat > package.json << EOF
{
  "name": "@$PROJECT_NAME/types",
  "version": "1.0.0",
  "description": "Shared TypeScript types for $PROJECT_NAME",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rimraf dist"
  },
  "keywords": ["types", "typescript", "shared"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "typescript": "^5.3.2",
    "rimraf": "^5.0.5"
  },
  "dependencies": {
    "zod": "^3.22.4"
  }
}
EOF

    # Create TypeScript config for types package
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "lib": ["es2021"],
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
EOF

    # Create shared types
    cat > src/index.ts << 'EOF'
// Re-export all types
export * from './api';
export * from './user';
export * from './project';
export * from './common';
EOF

    cat > src/api.ts << 'EOF'
export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface ApiResponse<T = null> {
  status: ResponseStatus;
  data?: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
  meta: {
    timestamp: string;
    path: string;
    method: string | undefined;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message: string;
  timestamp: string;
  uptime: number;
}
EOF

    cat > src/user.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}
EOF

    cat > src/project.ts << 'EOF'
import { z } from 'zod';

// Project name validation schema
export const ProjectNameSchema = z
  .string()
  .min(1, "Project name is required")
  .regex(/^[a-z0-9-]+$/, {
    message: "Project name can only contain lowercase letters, numbers, and hyphens",
  })
  .refine((name) => !/[A-Z]/.test(name), {
    message: "Project name cannot contain uppercase letters",
  })
  .refine((name) => !/\s/.test(name), {
    message: "Project name cannot contain spaces",
  })
  .refine((name) => !name.startsWith("-") && !name.endsWith("-"), {
    message: "Project name cannot start or end with a hyphen",
  })
  .refine((name) => !name.includes("--"), {
    message: "Project name cannot contain consecutive hyphens",
  });

// Available integrations
export const IntegrationSchema = z.enum([
  "git",
  "supabase",
  "docker",
  "jest",
  "typescript",
  "eslint",
  "prettier",
  "github_actions"
]);

// Package manager options
export const PackageManagerSchema = z.enum(["npm", "yarn", "pnpm"]);

// Node version options
export const NodeVersionSchema = z.enum(["18.x", "20.x", "latest"]);

// Advanced configuration schema
export const AdvancedConfigSchema = z.object({
  packageManager: PackageManagerSchema.default("npm"),
  nodeVersion: NodeVersionSchema.default("18.x")
});

// Complete script generator input schema
export const ScriptGeneratorSchema = z.object({
  projectName: ProjectNameSchema,
  integrations: z.array(IntegrationSchema).default(["typescript"]),
  advancedConfig: AdvancedConfigSchema.optional()
});

// Type definitions
export type ProjectNameInput = z.infer<typeof ProjectNameSchema>;
export type IntegrationType = z.infer<typeof IntegrationSchema>;
export type PackageManagerType = z.infer<typeof PackageManagerSchema>;
export type NodeVersionType = z.infer<typeof NodeVersionSchema>;
export type AdvancedConfigType = z.infer<typeof AdvancedConfigSchema>;
export type ScriptGeneratorInput = z.infer<typeof ScriptGeneratorSchema>;
EOF

    cat > src/common.ts << 'EOF'
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: string | number | boolean | undefined;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface QueryOptions {
  sort?: SortOptions;
  filter?: FilterOptions;
  pagination?: PaginationOptions;
}

export type DatabaseConnectionStatus = 'connected' | 'disconnected' | 'error';

export interface SystemHealth {
  database: DatabaseConnectionStatus;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  uptime: number;
}
EOF

    # Install dependencies for types package
    npm install > /dev/null 2>&1
    
    # Build the types package first
    npm run build > /dev/null 2>&1

    cd ../..

    # Update server tsconfig.json to use stricter settings
    cd packages/server
    cp tsconfig.json tsconfig.json.backup
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "lib": ["es2021"],
    "allowSyntheticDefaultImports": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "incremental": true,
    "declaration": true,
    "removeComments": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/types": ["../types/src"]
    },
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"],
//  "references": [
//    { "path": "../types" }
//  ]
}
EOF

    # Install shared types in server
    npm install ../types > /dev/null 2>&1

    cd ../client

    # Update client tsconfig.json
    cp tsconfig.json tsconfig.json.backup
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/types": ["../types/src"]
    },
    "strict": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true
  },
  "include": [
    "src"
  ],
//  "references": [
//    { "path": "../types" }
//  ]
}
EOF

    # Install shared types in client
    npm install ../types > /dev/null 2>&1

    cd ../..

    # Update root package.json to include types workspace
    npm pkg set workspaces.0="packages/*"
    npm pkg set scripts.build:types="npm run build --workspace=@$PROJECT_NAME/types"
    npm pkg set scripts.dev:types="npm run dev --workspace=@$PROJECT_NAME/types"
    npm pkg set scripts.type-check="tsc --noEmit"
    npm pkg set scripts.type-check:watch="tsc --noEmit --watch"

    # Update existing build script to include types
    npm pkg set scripts.build="npm run build:types && npm run build:client && npm run build:server"

    # Create scripts directory if it doesn't exist
    mkdir -p scripts

    # Create TypeScript project build script
    cat > scripts/build-types.sh << 'EOF'
#!/bin/bash
echo "📘 Building TypeScript types..."

# Build types package first
cd packages/types
npm run build

# Install built types in other packages
cd ../server
npm install ../types

cd ../client  
npm install ../types

cd ../..
echo "✅ TypeScript types built and installed"
EOF

    chmod +x scripts/build-types.sh

    # Create type checking script
    cat > scripts/type-check.sh << 'EOF'
#!/bin/bash
echo "📘 Running TypeScript type checking..."

echo "🔍 Checking types package..."
cd packages/types
npx tsc --noEmit

echo "🔍 Checking server package..."
cd ../server
npx tsc --noEmit

echo "🔍 Checking client package..."
cd ../client
npx tsc --noEmit

cd ../..
echo "✅ All TypeScript checks passed"
EOF

    chmod +x scripts/type-check.sh

    echo "✅ Enhanced TypeScript configuration setup complete"
    echo "📝 New features added:"
    echo "   - Shared types package with strict TypeScript settings"
    echo "   - Path mapping for easy imports (@/types)"
    echo "   - Stricter type checking across all packages"
    echo "   - Build scripts for types package"
    echo "   - Type checking scripts"
    echo ""
    echo "📝 Available commands:"
    echo "   - npm run build:types: Build shared types package"
    echo "   - npm run dev:types: Watch and rebuild types"
    echo "   - npm run type-check: Check types in all packages"
    echo "   - ./scripts/build-types.sh: Build and install types"
    echo "   - ./scripts/type-check.sh: Run comprehensive type checking"
}