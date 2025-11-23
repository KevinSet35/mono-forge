import {
    ScriptGeneratorInput,
    ScriptGenerationData,
    ScriptGeneratorSchema
} from '@mono-forge/types';
import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class AIScriptGeneratorService {
    constructor() { }

    /**
     * Generate script with full metadata and validation using AI
     */
    async generateScriptWithData(scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        console.log('---AI ScriptInput:', scriptInput);

        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);

            console.log('Generating script with AI:', {
                projectName: validatedInput.projectName,
                integrations: validatedInput.integrations,
                advancedConfig: validatedInput.advancedConfig
            });

            // TODO: Implement AI-based script generation logic
            const script = await this.generateScriptsWithAI(validatedInput);

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
            console.error('AI script generation error:', error);
            throw this.handleScriptGenerationError(error);
        }
    }

    /**
     * Generate raw script string only using AI
     */
    async generateScriptRaw(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('---AI ScriptInput_1:', scriptInput);

        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            return await this.generateScriptsWithAI(validatedInput);
        } catch (error) {
            console.error('AI script generation error:', error);
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to generate script with AI'
            );
        }
    }

    /**
     * Core AI-based script generation logic
     * TODO: Implement this method with your AI logic
     */
    private async generateScriptsWithAI(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('Generating scripts with AI for input:', scriptInput);

        // TODO: Implement your AI-based script generation logic here
        // This is a placeholder that throws an error
        throw new Error('AI script generation not yet implemented');
    }

    private handleScriptGenerationError(error: any): BadRequestException {
        if (error.name === 'ZodError') {
            return new BadRequestException({
                message: 'Invalid input parameters',
                details: error.errors
            });
        }

        return new BadRequestException(
            error instanceof Error ? error.message : 'Failed to generate script with AI'
        );
    }
}
