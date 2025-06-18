// src/modules/generatescript/generatescript.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import {
    ScriptGeneratorInput,
    ScriptGenerationData,
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData
} from '@mono-forge/types';
import { ScriptGeneratorService } from './generatescript.service';

@Controller('generatescript')
export class GeneratescriptController {
    constructor(
        private readonly scriptGeneratorService: ScriptGeneratorService,
    ) { }

    @Post()
    async generateScript(@Body() scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        return this.scriptGeneratorService.generateScriptWithData(scriptInput);
    }

    @Post('generate')
    async generateScriptRaw(@Body() scriptInput: ScriptGeneratorInput): Promise<string> {
        return this.scriptGeneratorService.generateScriptRaw(scriptInput);
    }

    @Get('integrations')
    getAvailableIntegrations(): IntegrationsListData {
        return this.scriptGeneratorService.getAvailableIntegrations();
    }

    @Get('package-managers')
    getPackageManagers(): PackageManagersData {
        return this.scriptGeneratorService.getPackageManagers();
    }

    @Get('node-versions')
    getNodeVersions(): NodeVersionsData {
        return this.scriptGeneratorService.getNodeVersions();
    }

    @Post('validate')
    validateInput(@Body() scriptInput: any): ValidationData {
        return this.scriptGeneratorService.validateInput(scriptInput);
    }
}