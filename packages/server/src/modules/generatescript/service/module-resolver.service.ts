import { Injectable } from '@nestjs/common';
import { IntegrationType } from '@mono-forge/types';
import { BASE_MODULES, INTEGRATION_CONFIGS } from '../config/integration.config';

@Injectable()
export class ModuleResolverService {
    buildModuleList(integrations: IntegrationType[]): string[] {
        // let modules = [...BASE_MODULES];
        const modules: string[] = [...BASE_MODULES as readonly string[]];

        integrations.forEach(integration => {
            const config = INTEGRATION_CONFIGS[integration];
            if (config) {
                modules.push(...config.modules);
            }
        });

        return modules;
    }

}