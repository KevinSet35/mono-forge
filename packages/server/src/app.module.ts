import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { GeneratescriptModule } from './modules/generatescript/generatescript.module';

@Module({
    imports: [
        UsersModule,
        GeneratescriptModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
