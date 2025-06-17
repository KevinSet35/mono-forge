#!/bin/bash

setup_docker() {
    echo "🐳 Setting up Docker configuration..."
    
    # Create multi-stage Dockerfile
    cat > Dockerfile << 'EOF'
# Multi-stage Docker build for production
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

# Copy the built application
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/packages/server/dist ./packages/server/dist
COPY --from=build --chown=nextjs:nodejs /app/packages/client/build ./packages/client/build
COPY --chown=nextjs:nodejs package*.json ./

USER nextjs

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "start"]
EOF

    # Create docker-compose.yml for development
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  ${PROJECT_NAME}:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./packages/client/build:/app/packages/client/build
    restart: unless-stopped

  # Uncomment and configure if using a database
  # postgres:
  #   image: postgres:15-alpine
  #   environment:
  #     POSTGRES_DB: ${PROJECT_NAME}
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #   volumes:
  #     - postgres_data:/var/lib/postgresql/data
  #   ports:
  #     - "5432:5432"

# volumes:
#   postgres_data:
EOF

    # Create docker-compose.dev.yml for development
    cat > docker-compose.dev.yml << EOF
version: '3.8'

services:
  ${PROJECT_NAME}-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "5000:5000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/packages/client/node_modules
      - /app/packages/server/node_modules
    command: npm run dev
EOF

    # Create development Dockerfile
    cat > Dockerfile.dev << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000 5000

CMD ["npm", "run", "dev"]
EOF

    # Create .dockerignore
    cat > .dockerignore << 'EOF'
# Dependencies
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
/build
/dist
/packages/*/build
/packages/*/dist

# Development files
.git
.gitignore
README.md
.eslintcache
.nyc_output
coverage

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store

# Docker files
Dockerfile*
docker-compose*
EOF

    # Create Docker helper scripts
    mkdir -p scripts/docker
    
    cat > scripts/docker/build.sh << 'EOF'
#!/bin/bash
echo "🐳 Building Docker image..."
docker build -t ${PROJECT_NAME}:latest .
echo "✅ Docker image built successfully"
EOF

    cat > scripts/docker/run.sh << 'EOF'
#!/bin/bash
echo "🐳 Running Docker container..."
docker run -d -p 5000:5000 --name ${PROJECT_NAME} ${PROJECT_NAME}:latest
echo "✅ Container started at http://localhost:5000"
EOF

    cat > scripts/docker/dev.sh << 'EOF'
#!/bin/bash
echo "🐳 Starting development environment with Docker Compose..."
docker-compose -f docker-compose.dev.yml up --build
EOF

    # Make scripts executable
    chmod +x scripts/docker/*.sh

    echo "✅ Docker configuration setup complete"
    echo "📝 Available commands:"
    echo "   - docker-compose up: Start production environment"
    echo "   - docker-compose -f docker-compose.dev.yml up: Start development environment"
    echo "   - ./scripts/docker/build.sh: Build production image"
    echo "   - ./scripts/docker/run.sh: Run production container"
}