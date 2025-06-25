import { Module } from '@nestjs/common';
import { GeneratescriptController } from './controller/generatescript.controller';
import { ScriptGeneratorService } from './service/script-generator.service';
import { ScriptFileService } from './service/script-file.service';
import { ScriptBuilderService } from './service/script-builder.service';
import { IntegrationDataService } from './service/integration-data.service';
import { ModuleResolverService } from './service/module-resolver.service';

@Module({
    controllers: [GeneratescriptController],
    providers: [
        ScriptGeneratorService,
        ScriptFileService,
        ScriptBuilderService,
        IntegrationDataService,
        ModuleResolverService,
    ],
})
export class GeneratescriptModule { }