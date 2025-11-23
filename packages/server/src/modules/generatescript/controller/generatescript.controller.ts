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
import { ScriptGeneratorService } from '../service/template/script-generator.service';
import { ScriptGeneratorFactory } from '../factory/script-generator.factory';

@Controller('generatescript')
export class GeneratescriptController {
    constructor(
        private readonly scriptGeneratorService: ScriptGeneratorService,
        private readonly scriptGeneratorFactory: ScriptGeneratorFactory,
    ) { }

    @Post()
    async generateScript(@Body() scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        return this.scriptGeneratorFactory.generateScriptWithData(scriptInput);
    }

    @Post('generate')
    async generateScriptRaw(@Body() scriptInput: ScriptGeneratorInput): Promise<string> {
        return this.scriptGeneratorFactory.generateScriptRaw(scriptInput);
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