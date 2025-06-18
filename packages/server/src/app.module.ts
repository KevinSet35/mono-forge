import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratescriptModule } from './modules/generatescript/generatescript.module';

@Module({
    imports: [GeneratescriptModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
