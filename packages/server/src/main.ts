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
        .setTitle('Mono-Forge API')
        .setDescription('The Mono-Forge API documentation')
        .setVersion('1.0')
        .addTag('users')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    
    await app.listen(5000);
    console.log('Server running on port 5000');
}
bootstrap();
