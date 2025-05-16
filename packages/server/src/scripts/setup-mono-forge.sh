#!/bin/bash

# Project name is passed as a command line argument
PROJECT_NAME=$1

# Exit if no project name is provided
if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Please provide a project name as an argument"
  echo "Usage: ./setup-project.sh <project-name>"
  exit 1
fi

# Create the project root directory
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# Initialize the root package.json with workspaces
npm init -y

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

# Create the packages directory structure
mkdir -p packages/client packages/server

# Create the client package using create-react-app with TypeScript
npx create-react-app packages/client --template typescript

# Install Material UI and Axios in client package
cd packages/client
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios

# Update client package.json with the scoped name and version
mv package.json package.json.bak
cat package.json.bak | sed "s/\"name\": \"client\"/\"name\": \"@$PROJECT_NAME\/client\"/" | sed 's/"version": "0.1.0"/"version": "1.0.0"/' > package.json
rm package.json.bak

# Add proxy configuration to package.json for development API calls
sed -i '/"private": true,/a\  "proxy": "http://localhost:5000",' package.json

# Remove CSS files and update the App component with Material UI
rm src/App.css src/index.css

# Create a theme file
mkdir -p src/theme
cat > src/theme/theme.ts << EOF
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

# Create API service for communicating with the backend with updated baseURL
mkdir -p src/services
cat > src/services/api.ts << EOF
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

# Update index.tsx to use Material UI and remove index.css import
cat > src/index.tsx << EOF
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

# Create the server package
cd ../server
npm init -y

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

# Install server dependencies
npm install

# Initialize TypeScript configuration
npx tsc --init

# Update tsconfig.json for NestJS compatibility
cat > tsconfig.json << EOF
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

# Create NestJS application structure with revised folder structure
mkdir -p src/modules/users/interfaces

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

# Create app module files directly in src
cat > src/app.module.ts << EOF
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

# Create users module files in src/modules/users
cat > src/modules/users/users.module.ts << EOF
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

cat > src/modules/users/users.controller.ts << EOF
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

cat > src/modules/users/users.service.ts << EOF
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
    return this.users.find(user => user.id === id);
  }
}
EOF

# Create user interface
cat > src/modules/users/interfaces/user.interface.ts << EOF
export interface User {
  id: string;
  name: string;
  email: string;
}
EOF

# Return to the root directory
cd ../..

# Install root dependencies for managing the monorepo
npm install --save-dev concurrently rimraf

# Create configuration files
# .gitignore
cat > .gitignore << EOF
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

# .prettierrc
cat > .prettierrc << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
EOF

# Create README.md with project info
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

echo "${PROJECT_NAME} project setup complete with client-server integration and health check!"