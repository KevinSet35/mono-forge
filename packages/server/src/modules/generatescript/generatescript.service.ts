// src/modules/generatescript/generatescript.service.ts
import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { BashScriptPathProvider } from './bash-script.provider';
import { AdvancedConfigType, IntegrationType } from '@mono-forge/types';

@Injectable()
export class GeneratescriptService {
    constructor(
        private readonly bashScriptPathProvider: BashScriptPathProvider,
    ) { }

    generateScript(
        projectName: string,
        integrations: IntegrationType[] = ['typescript'],
        advancedConfig?: AdvancedConfigType
    ): string {
        const scriptFilePath = this.bashScriptPathProvider.getPath();
        console.log(`Reading file from ${scriptFilePath}`);
        const raw = readFileSync(scriptFilePath, 'utf-8');
        return raw.replace(/\$1/g, projectName);
    }

    // generateScript(projectName: string): string {
    //     const scriptFilePath = this.bashScriptPathProvider.getPath();
    //     console.log(`Reading file from ${scriptFilePath}`);
    //     const raw = readFileSync(scriptFilePath, 'utf-8');
    //     return raw.replace(/\$1/g, projectName);
    // }
}