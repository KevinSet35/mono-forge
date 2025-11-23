import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratescriptModule } from './modules/generatescript/generatescript.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes ConfigModule available globally without re-importing
            envFilePath: '.env', // Path to your .env file
        }),
        GeneratescriptModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
