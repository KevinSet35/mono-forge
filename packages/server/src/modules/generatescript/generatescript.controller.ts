// src/modules/generatescript/generatescript.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { GeneratescriptService } from './generatescript.service';

@Controller('generatescript')
export class GeneratescriptController {
    constructor(
        private readonly generatescriptService: GeneratescriptService,
    ) { }

    @Post()
    generateScript(
        @Body('projectName') projectName: string,
    ): string {
        return this.generatescriptService.generateScript(projectName);
    }
}
