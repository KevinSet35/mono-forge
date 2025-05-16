// src/modules/generatescript/generatescript.module.ts
import { Module } from '@nestjs/common';
import { GeneratescriptService } from './generatescript.service';
import { GeneratescriptController } from './generatescript.controller';
import { join } from 'path';
import { BashScriptPathProvider } from './bash-script.provider';

export const BASH_SCRIPT_PATH = 'BASH_SCRIPT_PATH';

@Module({
    controllers: [GeneratescriptController],
    providers: [
        BashScriptPathProvider,
        GeneratescriptService,
    ],
})
export class GeneratescriptModule { }
