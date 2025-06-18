// src/modules/generatescript/generatescript.module.ts
import { Module } from '@nestjs/common';
import { GeneratescriptController } from './generatescript.controller';
import { ScriptGeneratorService } from './generatescript.service';

export const BASH_SCRIPT_PATH = 'BASH_SCRIPT_PATH';

@Module({
    controllers: [GeneratescriptController],
    providers: [
        ScriptGeneratorService,
    ],
})
export class GeneratescriptModule { }
