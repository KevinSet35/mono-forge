import {
    ScriptGeneratorInput,
    ScriptGenerationData,
    ScriptGeneratorSchema
} from '@mono-forge/types';
import { Injectable } from '@nestjs/common';
import { ClaudeClientService } from '../../../claude-client/claude-client.service';
import { getMonorepoPrompt, getSystemPrompt } from '../../prompts/monorepo.prompt';

@Injectable()
export class AIScriptGeneratorService {
    constructor(
        private readonly claudeClientService: ClaudeClientService,
    ) { }

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
            // throw this.handleScriptGenerationError(error);
        }
    }

    /**
     * Generate raw script string only using AI
     */
    async generateScriptRaw(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('---AI ScriptInput_1:', scriptInput);
        return '';

        // try {
        //     const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
        //     return await this.generateScriptsWithAI(validatedInput);
        // } catch (error) {
        //     console.error('AI script generation error:', error);
        //     throw new BadRequestException(
        //         error instanceof Error ? error.message : 'Failed to generate script with AI'
        //     );
        // }
    }

    /**
     * Core AI-based script generation logic
     * TODO: Implement this method with your AI logic
     */
    private async generateScriptsWithAI(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('Generating scripts with AI for input:', scriptInput);
        const claudeOutputString = await this.claudeClientService.chat(
            getSystemPrompt(),
            getMonorepoPrompt(scriptInput.projectName)
        );

        const bashScript = this.extractBashScript(claudeOutputString);

        return bashScript;
    }

    private extractBashScript(response: string): string {
        // If Claude wraps it in markdown code blocks
        const bashCodeBlockRegex = /```(?:bash|sh)?\n([\s\S]*?)\n```/;
        const match = response.match(bashCodeBlockRegex);

        if (match) {
            return match[1];
        }

        // If it starts with shebang, assume entire response is the script
        if (response.trim().startsWith('#!/')) {
            return response;
        }

        // Otherwise return as-is
        return response;
    }

}
