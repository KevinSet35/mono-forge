#!/bin/bash

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