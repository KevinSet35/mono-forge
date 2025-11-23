import { Injectable } from '@nestjs/common';
import { IntegrationType, BASE_MODULES, getIntegrationConfig } from '@mono-forge/types';

@Injectable()
export class ModuleResolverService {
    buildModuleList(integrations: IntegrationType[]): string[] {
        const modules: string[] = [...BASE_MODULES as readonly string[]];

        integrations.forEach(integration => {
            const config = getIntegrationConfig(integration);
            if (config) {
                modules.push(...config.modules);
            }
        });

        return modules;
    }
}