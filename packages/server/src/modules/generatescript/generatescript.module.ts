// src/modules/generatescript/generatescript.module.ts
import { Module } from '@nestjs/common';
import { GeneratescriptController } from './generatescript.controller';
import { ScriptGeneratorService } from './generatescript.service';

@Module({
    controllers: [GeneratescriptController],
    providers: [
        ScriptGeneratorService,
    ],
})
export class GeneratescriptModule { }
