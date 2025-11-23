import { Module } from '@nestjs/common';
import { GeneratescriptController } from './controller/generatescript.controller';
import { ScriptGeneratorService } from './service/template/script-generator.service';
import { AIScriptGeneratorService } from './service/ai/ai-script-generator.service';
import { ScriptFileService } from './service/template/script-file.service';
import { ScriptBuilderService } from './service/template/script-builder.service';
import { IntegrationDataService } from './service/template/integration-data.service';
import { ModuleResolverService } from './service/template/module-resolver.service';
import { ScriptGeneratorFactory } from './factory/script-generator.factory';

@Module({
    controllers: [GeneratescriptController],
    providers: [
        ScriptGeneratorService,
        AIScriptGeneratorService,
        ScriptGeneratorFactory,
        ScriptFileService,
        ScriptBuilderService,
        IntegrationDataService,
        ModuleResolverService,
    ],
})
export class GeneratescriptModule { }