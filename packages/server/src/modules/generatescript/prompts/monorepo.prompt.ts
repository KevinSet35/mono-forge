export function getSystemPrompt(): string {
    return 'You are a bash script generator. Output only valid bash scripts without any explanations or markdown formatting.';
}

export function getMonorepoPrompt(monoRepoName: string): string {
    return `You are helping me set up a JavaScript/TypeScript monorepo.
IMPORTANT: 👉 Your final output must be a single Bash script that I can run locally. Running this script should fully scaffold the entire monorepo exactly as described — creating folders, package.json files, tsconfigs, turbo.json, NestJS servers, React clients, and shared packages.

Context

Monorepo name: ${monoRepoName}
Package manager: npm (not pnpm or yarn)
Tech stack:

Backend: NestJS (TypeScript + ESM)
Frontend: React SPA (TypeScript + ESM)


Every app under apps/* has the structure:

apps/<app>/
  client/   <- React (TS, ESM)
  server/   <- NestJS (TS, ESM)

No Next.js or Vite.
Using turborepo for orchestration.
Want one root node_modules (npm workspaces hoisting).
Root-level folders:

apps/ → all applications
packages/ → shared libraries (@${monoRepoName}/*)



Requirements

1. ESM Everywhere

All apps, packages, configs use:

"type": "module"
module: "ESNext"
moduleResolution: "Bundler"


2. Clean Import Aliases
Must support imports like:

import { Something } from "@${monoRepoName}/shared-types";

Include:

package.json exports
correct "name": "@${monoRepoName}/<pkg>"
root tsconfig paths mapping


3. npm Workspaces
Root package.json must include:

"workspaces": [
  "apps/*/client",
  "apps/*/server",
  "packages/*"
]

The root package.json must also specify the package manager at the end of the file:

"packageManager": "npm@10.9.2"

(Use the latest stable npm version available at the time - for example, npm@10.9.2 or whatever is current)

4. Turborepo
Provide a working turbo.json that must look exactly like this:

{
    "$schema": "https://turbo.build/schema.json",
    "globalDependencies": [
        "**/.env.*local",
        "tsconfig.base.json"
    ],
    "tasks": {
        "build": {
            "dependsOn": [
                "^build"
            ],
            "outputs": [
                "dist/**",
                "build/**"
            ],
            "env": [
                "NODE_ENV"
            ]
        },
        "dev": {
            "cache": false,
            "persistent": true,
            "dependsOn": [
                "^build"
            ]
        },
        "start": {
            "dependsOn": [
                "build"
            ],
            "cache": false
        },
        "typecheck": {
            "dependsOn": [
                "^build"
            ],
            "outputs": []
        },
        "lint": {
            "dependsOn": [
                "^build"
            ],
            "outputs": []
        },
        "test": {
            "dependsOn": [
                "^build"
            ],
            "outputs": [
                "coverage/**"
            ],
            "env": [
                "NODE_ENV"
            ]
        },
        "clean": {
            "cache": false
        }
    }
}

5. NestJS (ESM) Servers in apps/<app>/server
Each server must include:

"type": "module" in package.json
ESM-compatible NestJS configs
tsconfig.json + tsconfig.build.json (both using moduleResolution: "Bundler")
nest-cli.json with ESM output folder
minimal src/main.ts (ESM-compatible)
scripts:
   "dev" (watch mode)
   "build"
   "start"


6. React SPA Clients in apps/<app>/client
Each client must include:

"type": "module"
basic React setup using no Vite/Next (CRA-like folder structure but no CRA)
tsconfig using jsx: "react-jsx" and moduleResolution: "Bundler"
minimal src/index.tsx


7. Shared Packages in packages/*
Each package must include:

"name": "@${monoRepoName}/<package>"
"type": "module"
buildable TypeScript output to dist/
exports map
tsconfig extending root config with moduleResolution: "Bundler"


8. TypeScript Configuration
IMPORTANT: 
- Do NOT include "noEmit": true in any tsconfig.json files. All packages and apps need to emit compiled output.
- Do NOT include "rootDir": "./src" in the ROOT tsconfig.json file. The root tsconfig is a base configuration that gets extended by individual apps and packages, so it should not specify a rootDir. Only individual app/package tsconfig files should define their own rootDir if needed.

What I Want You to Produce

Your final output must be:
👉 A Bash script which, when executed, creates the entire monorepo folder structure and ALL required files, including:

Root

package.json (with workspaces, scripts, and packageManager field)
tsconfig.json (with paths and moduleResolution: "Bundler")
turbo.json (matching the exact format specified above)


Two Example Apps

apps/dummy-app/client
apps/dummy-app/server (NestJS ESM)
apps/admin/client
apps/admin/server (NestJS ESM)

Each with full configs + sample source files.

Two Shared Packages

packages/shared-types
packages/shared-utils

Each with:

package.json
tsconfig.json
folder structure
example .ts file


File Tree Output

The script should create a clear, professional folder tree like:

${monoRepoName}/
  apps/
    dummy-app/
      client/
      server/
    admin/
      client/
      server/
  packages/
    shared-types/
    shared-utils/
  package.json
  tsconfig.json
  turbo.json

Style & Best Practices

Modern TypeScript
Fully ESM-compatible for both Nest + React
Use moduleResolution: "Bundler" consistently across all tsconfig files
Realistic dependency versions (no *)
Clean JSON formatting
Add comments where helpful
Script must be runnable on macOS or Linux (bash and standard unix tools)


Deliverable

👉 Output only the Bash script — no explanations. The script must be executable without modification.`;
}