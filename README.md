# Mono-Forge

A flexible monorepo template for multi-language projects.

## Project Structure

```
mono-forge/
├── package.json         # Root package.json for workspace management
├── packages/            # All packages live here
│   ├── client/          # React TypeScript client (@mono-forge/client)
│   │   └── src/         # Client source code with Material UI
│   └── server/          # NestJS TypeScript server (@mono-forge/server)
│       └── src/         # Server source code
│           ├── app.module.ts           # Root module directly in src
│           ├── app.controller.ts       # Root controller directly in src
│           ├── app.service.ts          # Root service directly in src
│           └── modules/                # Feature modules folder
│               └── users/              # Users module
└── README.md            # This file
```

## Quick Start

1. Clone this repository
2. Install dependencies
   ```
   npm install
   ```
3. Start development servers
   ```
   npm run dev
   ```
   This will start both client and server in development mode.

## Available Scripts

### Development
- `npm run dev` - Start both client and server in development mode
- `npm run dev:client` - Start only the client in development mode
- `npm run dev:server` - Start only the server in development mode

### Building
- `npm run build` - Build both client and server
- `npm run build:client` - Build only the client
- `npm run build:server` - Build only the server

### Production
- `npm run start` - Start the production server
- `npm run start:client` - Start the client in production mode
- `npm run start:server` - Start the server in production mode

### Utilities
- `npm run lint` - Run linting on all packages
- `npm run test` - Run tests on all packages
- `npm run clean` - Clean all build artifacts

## Features

- 📦 Monolithic repository with npm workspaces
- 🔄 TypeScript for both client and server
- ⚛️ React for the client side with Material UI
- 🦅 NestJS for the server side
- 🧪 Testing setup with Jest
- 🔍 ESLint for code quality
- 💅 Prettier for code formatting
- 🔄 Client-server communication example with health check

## Package Naming Convention
- Client: `@mono-forge/client`
- Server: `@mono-forge/server`

## NestJS Structure

The server follows a modular architecture:
- Root module (AppModule) is directly in the src folder
- Feature modules are organized in the src/modules directory
- Each feature module has its own controllers, services, and interfaces

## API Documentation

The NestJS backend includes Swagger documentation available at:
`http://localhost:5000/api/docs`

## API Configuration Notes

- All API endpoints have the prefix `/api`
- CORS is enabled and configured for the React frontend
- The client is configured to communicate with the correct API paths

## Extending Mono-Forge

This template provides a starting point for JavaScript/TypeScript projects, but can be extended to support other languages:

- **Python**: Add a Python package under `packages/python-service`
- **C++**: Add a C++ package under `packages/cpp-module`
- **Rust**: Add a Rust crate under `packages/rust-service`

Each language would maintain its own build process while sharing the monorepo infrastructure.

## License

MIT
