#!/bin/bash

# MONOREPO Project Setup Script
# Self-contained script - no external dependencies required
# Usage: ./setup-project.sh [project-name]

set -e  # Exit on any error

# Pre-configured project name and settings
PRECONFIGURED_PROJECT_NAME="multi-integration-project"
PACKAGE_MANAGER="yarn"
NODE_VERSION="20.x"
SELECTED_INTEGRATIONS="typescript git docker jest eslint"

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

create_root_directory() {
    echo "📁 Creating project root directory: $PROJECT_NAME"
    
    # Create the project root directory
    mkdir "$PROJECT_NAME"
    cd "$PROJECT_NAME"
    
    # Create the packages directory structure
    mkdir -p packages/client packages/server
    
    echo "✅ Root directory structure created"
}

init_workspaces() {
    echo "⚙️ Initializing workspace configuration..."
    
    # Initialize the root package.json with workspaces
    npm init -y > /dev/null 2>&1
    
    # Edit package.json to add workspaces configuration and scripts
    cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "version": "1.0.0",
  "description": "A flexible monorepo template for multi-language projects",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "npm run dev --workspace=@$PROJECT_NAME/client",
    "dev:server": "npm run dev --workspace=@$PROJECT_NAME/server",
    "build": "npm run build:client && npm run build:server",
    "build:client": "npm run build --workspace=@$PROJECT_NAME/client",
    "build:server": "npm run build --workspace=@$PROJECT_NAME/server",
    "start": "npm run start --workspace=@$PROJECT_NAME/server",
    "start:client": "npm run start --workspace=@$PROJECT_NAME/client",
    "start:server": "npm run start --workspace=@$PROJECT_NAME/server",
    "lint": "npm run lint --workspaces",
    "test": "npm run test --workspaces",
    "clean": "rimraf packages/*/dist packages/*/build"
  },
  "keywords": [
    "monorepo",
    "template",
    "workspace",
    "polyglot"
  ],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "concurrently": "^8.2.2",
    "rimraf": "^5.0.5"
  }
}
EOF
    
    echo "✅ Workspace configuration initialized"
}

setup_react_client() {
    echo "⚛️ Setting up React TypeScript client..."
    
    # Create the client package using create-react-app with TypeScript
    npx create-react-app packages/client --template typescript > /dev/null 2>&1
    
    # Install Material UI and Axios in client package
    cd packages/client
    npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios > /dev/null 2>&1
    
    # Update client package.json with the scoped name and version
    mv package.json package.json.bak
    cat package.json.bak | sed "s/\"name\": \"client\"/\"name\": \"@$PROJECT_NAME\/client\"/" | sed 's/"version": "0.1.0"/"version": "1.0.0"/' > package.json
    rm package.json.bak
    
    # Add proxy configuration to package.json for development API calls
    # Cross-platform compatible approach using awk
    cp package.json package.json.tmp
    awk '/"private": true,/{print; print "  \"proxy\": \"http://localhost:5000\","; next}1' package.json.tmp > package.json
    rm package.json.tmp
    
    # Remove CSS files and update the App component with Material UI
    rm src/App.css src/index.css
    
    create_theme_file
    create_api_service
    update_index_tsx
    update_app_tsx
    
    cd ../..
    echo "✅ React client setup complete"
}

create_theme_file() {
    # Create a theme file
    mkdir -p src/theme
    cat > src/theme/theme.ts << 'EOF'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

export default theme;
EOF
}

create_api_service() {
    # Create API service for communicating with the backend with updated baseURL
    mkdir -p src/services
    cat > src/services/api.ts << 'EOF'
import axios from 'axios';

// Base API configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Add this if you're using credentials: true in CORS
});

// Health check API call
export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking server health:', error);
    throw error;
  }
};

export default api;
EOF
}

update_index_tsx() {
    # Update index.tsx to use Material UI and remove index.css import
    cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme/theme';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOF
}

update_app_tsx() {
    # Replace App.tsx with a Material UI version that includes server health check
    cat > src/App.tsx << EOF
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  Paper,
  Stack,
  Divider,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import Grid from '@mui/material/Grid'; // Import Grid separately to ensure correct typing
import { 
  Apartment as ApartmentIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { checkServerHealth } from './services/api';

function App() {
  const [healthStatus, setHealthStatus] = useState<{status?: string; message?: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleHealthCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await checkServerHealth();
      setHealthStatus(response);
      setSnackbarOpen(true);
    } catch (err) {
      setError("Failed to connect to the server. Make sure it's running.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const features = [
    {
      title: 'Monorepo Structure',
      description: 'Organized codebase with modular architecture for better development experience',
      icon: <ApartmentIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'TypeScript Ready',
      description: 'Full TypeScript support for both frontend and backend components',
      icon: <CodeIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'Secure by Default',
      description: 'Best security practices implemented across the entire stack',
      icon: <SecurityIcon sx={{ fontSize: 40 }} color="primary" />
    },
    {
      title: 'Performance Optimized',
      description: 'Built with performance in mind to deliver exceptional user experience',
      icon: <SpeedIcon sx={{ fontSize: 40 }} color="primary" />
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ${PROJECT_NAME}
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleHealthCheck}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
            disabled={loading}
          >
            Check Server
          </Button>
          <Button color="inherit">Documentation</Button>
          <Button color="inherit">GitHub</Button>
        </Toolbar>
      </AppBar>
      
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? "error" : "success"} 
          sx={{ width: '100%' }}
        >
          {error || (healthStatus && \`Server status: \${healthStatus.status} - \${healthStatus.message}\`)}
        </Alert>
      </Snackbar>
      
      <Box 
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to ${PROJECT_NAME}
          </Typography>
          <Typography variant="h5" sx={{ mb: 4 }}>
            A modern, flexible monorepo template for multi-language projects
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            justifyContent="center"
          >
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              size="large"
              sx={{ px: 4, py: 1 }}
            >
              Learn More
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Key Features
        </Typography>
        <Box sx={{ flexGrow: 1, mt: 2 }}>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid key={index} sx={{ width: { xs: '100%', sm: '50%' }, padding: 2 }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="center" mb={2}>
                      {feature.icon}
                    </Box>
                    <Typography gutterBottom variant="h5" component="h3" textAlign="center">
                      {feature.title}
                    </Typography>
                    <Typography textAlign="center">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {healthStatus && (
        <Container sx={{ mb: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CheckCircleIcon color="success" />
                <Typography variant="h6">
                  Server Connection: {healthStatus.status}
                </Typography>
              </Box>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {healthStatus.message}
              </Typography>
            </CardContent>
          </Card>
        </Container>
      )}

      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container>
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
            Project Structure
          </Typography>
          <Paper sx={{ p: 3, mt: 4 }}>
            <pre style={{ overflowX: 'auto', margin: 0 }}>
              {\`${PROJECT_NAME}/
├── package.json         # Root package.json for workspace management
├── packages/            # All packages live here
│   ├── client/          # React TypeScript client (@${PROJECT_NAME}/client)
│   └── server/          # NestJS TypeScript server (@${PROJECT_NAME}/server)
│       └── src/         # Server source code
│           ├── app.module.ts          
│           └── modules/               
└── README.md\`}
            </pre>
          </Paper>
        </Container>
      </Box>

      <Container sx={{ py: 8 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
              <Typography variant="h3" component="h2" gutterBottom>
                Ready to Build?
              </Typography>
              <Typography paragraph>
                ${PROJECT_NAME} provides a solid foundation for building modern web applications
                with a well-structured monorepo setup, TypeScript integration, and best practices
                already configured.
              </Typography>
              <Button variant="contained" color="primary" size="large">
                Start Your Project
              </Button>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' }, padding: 2 }}>
              <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
                <pre style={{ 
                  backgroundColor: '#282c34', 
                  color: '#abb2bf',
                  padding: '16px',
                  borderRadius: '8px',
                  overflowX: 'auto'
                }}>
                  {\`\$ npx create-${PROJECT_NAME} my-project
\$ cd my-project
\$ npm install
\$ npm run dev

🚀 Server running on port 5000
✅ Client started successfully\`}
                </pre>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>

      <Divider />
      
      <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ${PROJECT_NAME}. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </>
  );
}

export default App;
EOF
}

setup_nestjs_server() {
    echo "🦅 Setting up NestJS TypeScript server..."
    
    # Create the server package
    cd packages/server
    npm init -y > /dev/null 2>&1
    
    create_server_package_json
    install_server_dependencies
    setup_typescript_config
    create_nestjs_structure
    
    cd ../..
    echo "✅ NestJS server setup complete"
}

create_server_package_json() {
    # Create server package.json with proper escaping of backslashes
    cat > package.json << EOF
{
  "name": "@${PROJECT_NAME}/server",
  "version": "1.0.0",
  "description": "NestJS server for ${PROJECT_NAME}",
  "main": "dist/main.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@nestjs/common": "^10.2.6",
    "@nestjs/core": "^10.2.6",
    "@nestjs/platform-express": "^10.2.6",
    "@nestjs/swagger": "^7.1.13",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.1.18",
    "@nestjs/schematics": "^10.0.2",
    "@nestjs/testing": "^10.2.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.10",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.0",
    "@types/supertest": "^2.0.16",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint": "^8.54.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.1",
    "jest": "^29.7.0",
    "prettier": "^3.1.0",
    "source-map-support": "^0.5.21",
    "supertest": "^6.3.3",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.3.2"
  },
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "src",
    "testRegex": ".*\\\\.spec\\\\.ts$",
    "transform": {
      "^.+\\\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
EOF
}

install_server_dependencies() {
    # Install server dependencies
    npm install > /dev/null 2>&1
}

setup_typescript_config() {
    # Initialize TypeScript configuration
    npx tsc --init > /dev/null 2>&1
    
    # Update tsconfig.json for NestJS compatibility
    cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "es2021",
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
EOF
}

create_nestjs_structure() {
    # Create NestJS application structure with revised folder structure
    mkdir -p src/modules/users/interfaces
    
    create_main_ts
    create_app_files
    create_users_module
}

create_main_ts() {
    # Create main.ts file with the updated version
    cat > src/main.ts << EOF
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: "http://localhost:3000",
        credentials: true, // if you're using cookies or auth headers
    });
    
    // Global pipes
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );
    
    // Security middleware
    //   app.use(helmet());
    //   app.use(cors());
    
    // Swagger documentation
    const config = new DocumentBuilder()
        .setTitle('${PROJECT_NAME} API')
        .setDescription('The ${PROJECT_NAME} API documentation')
        .setVersion('1.0')
        .addTag('users')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    await app.listen(5000);
    console.log('Server running on port 5000');
}
bootstrap();
EOF
}

create_app_files() {
    # Create app module files directly in src
    cat > src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

    cat > src/app.controller.ts << EOF
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok', message: 'Server is running' };
  }
}
EOF

    cat > src/app.service.ts << EOF
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to ${PROJECT_NAME} API!';
  }
}
EOF
}

create_users_module() {
    # Create users module files in src/modules/users
    cat > src/modules/users/users.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
EOF

    cat > src/modules/users/users.controller.ts << 'EOF'
import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): User[] {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): User {
    return this.usersService.findOne(id);
  }
}
EOF

    cat > src/modules/users/users.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find(user => user.id === id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }
}
EOF

    # Create user interface
    cat > src/modules/users/interfaces/user.interface.ts << 'EOF'
export interface User {
  id: string;
  name: string;
  email: string;
}
EOF
}

install_root_dependencies() {
    echo "📦 Installing root dependencies..."
    
    # Install root dependencies for managing the monorepo
    npm install --save-dev concurrently rimraf > /dev/null 2>&1
    
    echo "✅ Root dependencies installed"
}

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

create_readme() {
    echo "📝 Creating README.md..."
    
    cat > README.md << EOF
# ${PROJECT_NAME}

A flexible monorepo template for multi-language projects.

## Project Structure

\`\`\`
${PROJECT_NAME}/
├── package.json         # Root package.json for workspace management
├── packages/            # All packages live here
│   ├── client/          # React TypeScript client (@${PROJECT_NAME}/client)
│   │   └── src/         # Client source code with Material UI
│   └── server/          # NestJS TypeScript server (@${PROJECT_NAME}/server)
│       └── src/         # Server source code
│           ├── app.module.ts           # Root module directly in src
│           ├── app.controller.ts       # Root controller directly in src
│           ├── app.service.ts          # Root service directly in src
│           └── modules/                # Feature modules folder
│               └── users/              # Users module
└── README.md            # This file
\`\`\`

## Quick Start

1. Clone this repository
2. Install dependencies
   \`\`\`
   npm install
   \`\`\`
3. Start development servers
   \`\`\`
   npm run dev
   \`\`\`
   This will start both client and server in development mode.

## Available Scripts

### Development
- \`npm run dev\` - Start both client and server in development mode
- \`npm run dev:client\` - Start only the client in development mode
- \`npm run dev:server\` - Start only the server in development mode

### Building
- \`npm run build\` - Build both client and server
- \`npm run build:client\` - Build only the client
- \`npm run build:server\` - Build only the server

### Production
- \`npm run start\` - Start the production server
- \`npm run start:client\` - Start the client in production mode
- \`npm run start:server\` - Start the server in production mode

### Utilities
- \`npm run lint\` - Run linting on all packages
- \`npm run test\` - Run tests on all packages
- \`npm run clean\` - Clean all build artifacts

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
- Client: \`@${PROJECT_NAME}/client\`
- Server: \`@${PROJECT_NAME}/server\`

## NestJS Structure

The server follows a modular architecture:
- Root module (AppModule) is directly in the src folder
- Feature modules are organized in the src/modules directory
- Each feature module has its own controllers, services, and interfaces

## API Documentation

The NestJS backend includes Swagger documentation available at:
\`http://localhost:5000/api/docs\`

## API Configuration Notes

- All API endpoints have the prefix \`/api\`
- CORS is enabled and configured for the React frontend
- The client is configured to communicate with the correct API paths

## Extending ${PROJECT_NAME}

This template provides a starting point for JavaScript/TypeScript projects, but can be extended to support other languages:

- **Python**: Add a Python package under \`packages/python-service\`
- **C++**: Add a C++ package under \`packages/cpp-module\`
- **Rust**: Add a Rust crate under \`packages/rust-service\`

Each language would maintain its own build process while sharing the monorepo infrastructure.

## License

MIT
EOF
    
    echo "✅ README.md created"
}

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

setup_git() {
    echo "🔧 Setting up Git repository..."
    
    # Initialize git repository
    git init
    
    # Create .gitattributes for proper line endings
    cat > .gitattributes << 'EOF'
* text=auto
*.js text eol=lf
*.ts text eol=lf
*.json text eol=lf
*.md text eol=lf
*.yml text eol=lf
*.yaml text eol=lf
EOF

    # Create initial commit
    if [ -z "$(git config user.name)" ]; then
        echo "📝 Please configure Git user information:"
        echo "git config --global user.name 'Your Name'"
        echo "git config --global user.email 'your.email@example.com'"
    fi

    echo "✅ Git repository initialized"
}

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
echo "🐳 Building Docker image..."
docker build -t ${PROJECT_NAME}:latest .
echo "✅ Docker image built successfully"
EOF

    cat > scripts/docker/run.sh << 'EOF'
echo "🐳 Running Docker container..."
docker run -d -p 5000:5000 --name ${PROJECT_NAME} ${PROJECT_NAME}:latest
echo "✅ Container started at http://localhost:5000"
EOF

    cat > scripts/docker/dev.sh << 'EOF'
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

setup_jest() {
    echo "🧪 Setting up Jest testing framework..."
    
    # Install Jest dependencies at root level
    npm install --save-dev jest @types/jest ts-jest
    
    # Create root Jest configuration for workspace
    cat > jest.config.js << 'EOF'
module.exports = {
  projects: [
    '<rootDir>/packages/client',
    '<rootDir>/packages/server'
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    '!packages/*/src/**/*.spec.ts',
    '!packages/*/src/**/*.test.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
EOF

    # Setup Jest for server package
    cd packages/server
    npm install --save-dev jest @types/jest ts-jest supertest @types/supertest
    
    cat > jest.config.js << 'EOF'
module.exports = {
  displayName: 'server',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
  ],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
};
EOF

    # Create test setup file
    mkdir -p src/test
    cat > src/test/setup.ts << 'EOF'
import { Test } from '@nestjs/testing';

// Global test setup
beforeAll(async () => {
  // Setup code that runs before all tests
});

afterAll(async () => {
  // Cleanup code that runs after all tests
});
EOF

    # Create sample test files
    mkdir -p src/__tests__
    cat > src/__tests__/app.service.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return welcome message', () => {
    const result = service.getHello();
    expect(result).toContain('Welcome to');
    expect(typeof result).toBe('string');
  });
});
EOF

    cat > src/__tests__/app.controller.spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';
import { AppService } from '../app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return welcome message', () => {
      const result = 'Welcome to test!';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);

      expect(appController.getHello()).toBe(result);
    });
  });

  describe('healthCheck', () => {
    it('should return health status', () => {
      const result = appController.healthCheck();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('message');
    });
  });
});
EOF

    # Create integration test example
    mkdir -p src/test/integration
    cat > src/test/integration/app.e2e-spec.ts << 'EOF'
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(res.text).toContain('Welcome to');
      });
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message');
      });
  });
});
EOF

    cd ../client
    
    # Jest is already configured with Create React App, just add some additional config
    cat > src/setupTests.ts << 'EOF'
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock API calls
global.fetch = jest.fn();

// Setup for each test
beforeEach(() => {
  (fetch as jest.Mock).mockClear();
});
EOF

    # Create sample React component test
    cat > src/__tests__/App.test.tsx << 'EOF'
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import App from '../App';
import theme from '../theme/theme';
import * as apiService from '../services/api';

// Mock the API service
jest.mock('../services/api');
const mockedApiService = apiService as jest.Mocked<typeof apiService>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    mockedApiService.checkServerHealth.mockClear();
  });

  it('renders welcome message', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/Welcome to/)).toBeInTheDocument();
  });

  it('renders check server button', () => {
    renderWithTheme(<App />);
    expect(screen.getByText(/Check Server/)).toBeInTheDocument();
  });

  it('calls health check when button is clicked', async () => {
    mockedApiService.checkServerHealth.mockResolvedValue({
      status: 'ok',
      message: 'Server is running'
    });

    renderWithTheme(<App />);
    
    const checkButton = screen.getByText(/Check Server/);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockedApiService.checkServerHealth).toHaveBeenCalledTimes(1);
    });
  });

  it('displays error when health check fails', async () => {
    mockedApiService.checkServerHealth.mockRejectedValue(new Error('Server error'));

    renderWithTheme(<App />);
    
    const checkButton = screen.getByText(/Check Server/);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to connect to the server/)).toBeInTheDocument();
    });
  });
});
EOF

    cd ../..

    # Update package.json scripts to include test commands
    npm pkg set scripts.test:server="npm run test --workspace=@$PROJECT_NAME/server"
    npm pkg set scripts.test:client="npm run test --workspace=@$PROJECT_NAME/client"
    npm pkg set scripts.test:e2e="npm run test:server -- --testPathPattern=e2e"
    npm pkg set scripts.test:coverage="jest --coverage"
    npm pkg set scripts.test:watch="jest --watch"

    echo "✅ Jest testing framework setup complete"
    echo "📝 Available test commands:"
    echo "   - npm test: Run all tests"
    echo "   - npm run test:server: Run server tests only"
    echo "   - npm run test:client: Run client tests only"
    echo "   - npm run test:e2e: Run end-to-end tests"
    echo "   - npm run test:coverage: Run tests with coverage report"
    echo "   - npm run test:watch: Run tests in watch mode"
}

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

# Main execution flow
main() {
    echo "🚀 Starting ${PROJECT_NAME} project setup..."
    echo "📦 Package Manager: ${PACKAGE_MANAGER}"
    echo "🟢 Node Version: ${NODE_VERSION}"
    echo "🔧 Integrations: ${SELECTED_INTEGRATIONS}"
    
    validate_arguments "$@"
    create_root_directory
    init_workspaces
    setup_react_client
    setup_nestjs_server
    install_root_dependencies
    create_config_files
    create_readme
    setup_typescript_enhanced
    setup_git
    setup_docker
    setup_jest
    setup_eslint
    
    echo "✅ ${PROJECT_NAME} project setup complete!"
    echo "🎉 Selected integrations have been configured"
}

# Run main function with all arguments
main "$@"