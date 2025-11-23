import {
    ScriptGeneratorInput,
    IntegrationType,
    AdvancedConfigType,
    ScriptGenerationData,
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData,
    ScriptGeneratorSchema
} from '@mono-forge/types';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ScriptFileService } from './script-file.service';
import { ScriptBuilderService } from './script-builder.service';
import { IntegrationDataService } from './integration-data.service';
import { ModuleResolverService } from './module-resolver.service';

@Injectable()
export class ScriptGeneratorService {
    constructor(
        private readonly scriptFileService: ScriptFileService,
        private readonly scriptBuilderService: ScriptBuilderService,
        private readonly integrationDataService: IntegrationDataService,
        private readonly moduleResolverService: ModuleResolverService
    ) { }

    /**
     * Generate script with full metadata and validation
     */
    async generateScriptWithData(scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        console.log('---ScriptInput:', scriptInput);

        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);

            console.log('Generating script with:', {
                projectName: validatedInput.projectName,
                integrations: validatedInput.integrations,
                advancedConfig: validatedInput.advancedConfig
            });

            const script = await this.generateScripts(validatedInput);
            console.log('script is:', script);

            return {
                script,
                projectName: validatedInput.projectName,
                integrations: validatedInput.integrations,
                advancedConfig: validatedInput.advancedConfig,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    scriptLength: script.length,
                    integrationsCount: validatedInput.integrations.length
                }
            };
        } catch (error) {
            console.error('Script generation error:', error);
            throw this.handleScriptGenerationError(error);
        }
    }

    /**
     * Generate raw script string only
     */
    async generateScriptRaw(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('---ScriptInput_1:', scriptInput);

        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            return await this.generateScripts(validatedInput);
        } catch (error) {
            console.error('Script generation error:', error);
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to generate script'
            );
        }
    }

    /**
     * Get available integrations with categories
     */
    getAvailableIntegrations(): IntegrationsListData {
        console.log('---getAvailableIntegrations:');
        return this.integrationDataService.getAvailableIntegrations();
    }

    /**
     * Get available package managers
     */
    getPackageManagers(): PackageManagersData {
        console.log('---getPackageManagers:');
        return this.integrationDataService.getPackageManagers();
    }

    /**
     * Get available Node.js versions
     */
    getNodeVersions(): NodeVersionsData {
        console.log('---getNodeVersions:');
        return this.integrationDataService.getNodeVersions();
    }

    /**
     * Validate input data
     */
    validateInput(scriptInput: any): ValidationData {
        console.log('---validateInput:');
        return this.integrationDataService.validateInput(scriptInput);
    }

    /**
     * Core script generation logic
     */
    private async generateScripts(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('Generating scripts with input:', scriptInput);

        try {
            const modules = this.moduleResolverService.buildModuleList(scriptInput.integrations || []);
            const moduleScripts = await this.scriptFileService.readModuleScripts(modules);

            return this.scriptBuilderService.generateSelfContainedScript(
                'monorepo',
                moduleScripts,
                scriptInput.projectName,
                scriptInput.integrations || [],
                scriptInput.advancedConfig
            );
        } catch (error) {
            throw new NotFoundException(`Failed to generate scripts: ${error.message}`);
        }
    }

    private handleScriptGenerationError(error: any): BadRequestException {
        if (error.name === 'ZodError') {
            return new BadRequestException({
                message: 'Invalid input parameters',
                details: error.errors
            });
        }

        return new BadRequestException(
            error instanceof Error ? error.message : 'Failed to generate script'
        );
    }
}