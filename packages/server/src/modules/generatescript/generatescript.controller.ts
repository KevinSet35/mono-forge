// src/modules/generatescript/generatescript.controller.ts
import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import { GeneratescriptService } from './generatescript.service';
import { ScriptGeneratorInput } from '@mono-forge/types';
import { ScriptGeneratorService } from './template.service';

@Controller('generatescript')
export class GeneratescriptController {
    constructor(
        private readonly generatescriptService: GeneratescriptService,
        private readonly scriptGeneratorService: ScriptGeneratorService,
    ) { }

    // @Post()
    // generateScript(
    //     @Body('projectName') projectName: string,
    // ): string {
    //     return this.generatescriptService.generateScript(projectName);
    // }

    @Post()
    generateScript(@Body() scriptInput: ScriptGeneratorInput) {
        try {
            const { projectName, integrations, advancedConfig } = scriptInput;
            return this.generatescriptService.generateScript(
                projectName,
                integrations,
                advancedConfig
            )

            // return {
            //     success: true,
            //     data: this.generatescriptService.generateScript(
            //         projectName,
            //         integrations,
            //         advancedConfig
            //     )
            // };
        } catch (error) {
            throw new BadRequestException({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to generate script'
            });
        }
    }


    // constructor(private readonly scriptGeneratorService: ScriptGeneratorService) { }

    @Post('generate')
    generateScriptt(@Body() scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('In generateScriptt controller');
        return this.scriptGeneratorService.generateScripts(scriptInput); //generateScripts();
    }


}
