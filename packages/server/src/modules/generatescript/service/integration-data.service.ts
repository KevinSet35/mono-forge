import { Injectable } from '@nestjs/common';
import {
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData,
    ScriptGeneratorSchema,
    getAllIntegrations,
    getAllCategories,
    getAllPackageManagers,
    getAllNodeVersions
} from '@mono-forge/types';

@Injectable()
export class IntegrationDataService {
    getAvailableIntegrations(): IntegrationsListData {
        return {
            integrations: getAllIntegrations(),
            categories: getAllCategories()
        };
    }

    getPackageManagers(): PackageManagersData {
        return {
            packageManagers: getAllPackageManagers()
        };
    }

    getNodeVersions(): NodeVersionsData {
        return {
            nodeVersions: getAllNodeVersions()
        };
    }

    validateInput(scriptInput: any): ValidationData {
        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            return {
                isValid: true,
                validatedInput
            };
        } catch (error) {
            return {
                isValid: false,
                errors: error.errors || [{
                    message: error instanceof Error ? error.message : 'Validation failed'
                }]
            };
        }
    }
}