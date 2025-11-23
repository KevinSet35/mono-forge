import { Injectable } from '@nestjs/common';
import { ScriptGeneratorInput, ScriptGenerationData } from '@mono-forge/types';
import { ScriptGeneratorService } from '../service/template/script-generator.service';
import { AIScriptGeneratorService } from '../service/ai/ai-script-generator.service';

/**
 * Factory class that routes script generation requests to the appropriate service
 * based on the useAI parameter in the input
 */
@Injectable()
export class ScriptGeneratorFactory {
    constructor(
        private readonly scriptGeneratorService: ScriptGeneratorService,
        private readonly aiScriptGeneratorService: AIScriptGeneratorService,
    ) { }

    /**
     * Generate script with full metadata and validation
     * Routes to either traditional or AI-based service based on useAI flag
     */
    async generateScriptWithData(scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        if (scriptInput.useAI) {
            console.log('Routing to AI-based script generator');
            return this.aiScriptGeneratorService.generateScriptWithData(scriptInput);
        } else {
            console.log('Routing to traditional script generator');
            return this.scriptGeneratorService.generateScriptWithData(scriptInput);
        }
    }

    /**
     * Generate raw script string only
     * Routes to either traditional or AI-based service based on useAI flag
     */
    async generateScriptRaw(scriptInput: ScriptGeneratorInput): Promise<string> {
        if (scriptInput.useAI) {
            console.log('Routing to AI-based script generator (raw)');
            return this.aiScriptGeneratorService.generateScriptRaw(scriptInput);
        } else {
            console.log('Routing to traditional script generator (raw)');
            return this.scriptGeneratorService.generateScriptRaw(scriptInput);
        }
    }
}
