#!/bin/bash

# Setup NestJS TypeScript server
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
    return this.users.find(user => user.id === id);
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