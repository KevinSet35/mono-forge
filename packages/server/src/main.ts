import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from "dotenv";
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as path from 'path';
import { PathUtil } from './common/utility/PathUtil';
import { ServeStaticMiddleware } from './common/middleware/serve-static-middleware';
import { NestExpressApplication } from '@nestjs/platform-express';

// Load environment variables from the root directory
config({
    path: path.resolve(__dirname, '../../..', '.env')
});

async function bootstrap() {
    const PORT = Number(process.env.PORT) || Number(process.env.SERVER_PORT) || 5000;
    const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 3000;

    console.log(`---Loading environment: SERVER_PORT=${PORT}, CLIENT_PORT=${CLIENT_PORT}---`);

    const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);

    // Set global prefix for all routes
    app.setGlobalPrefix("api");

    // Configure CORS
    app.enableCors({
        origin: (origin, callback) => {
            const allowedOrigins = [
                `http://localhost:${CLIENT_PORT}`,
                process.env.CLIENT_ORIGIN,
            ].filter(Boolean);

            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error(`CORS error: origin ${origin} not allowed`));
            }
        },
        credentials: true,
    });


    // Serve the static files from the React app
    app.useStaticAssets(PathUtil.getStaticAssetsPath());

    // Apply the ServeStaticMiddleware
    app.use(new ServeStaticMiddleware().use);


    // Apply global interceptors and filters
    app.useGlobalInterceptors(new ResponseInterceptor());
    app.useGlobalFilters(new HttpExceptionFilter());

    // Apply global validation pipe with transformation options
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Remove properties that are not defined in the DTO
            forbidNonWhitelisted: true, // Throw error if unknown properties are present
            transform: true, // Automatically transform payloads to DTO instances
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Start the server - THIS WAS MISSING!
    await app.listen(PORT);

    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
}

bootstrap().catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});