import { Injectable } from '@nestjs/common';
import {
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData,
    ScriptGeneratorSchema
} from '@mono-forge/types';

@Injectable()
export class IntegrationDataService {
    getAvailableIntegrations(): IntegrationsListData {
        return {
            integrations: [
                {
                    id: 'git',
                    name: 'Git',
                    description: 'Initialize Git repository with proper configuration',
                    category: 'version-control'
                },
                {
                    id: 'supabase',
                    name: 'Supabase',
                    description: 'Supabase backend-as-a-service integration',
                    category: 'backend'
                },
                {
                    id: 'docker',
                    name: 'Docker',
                    description: 'Containerization with Docker and docker-compose',
                    category: 'deployment'
                },
                {
                    id: 'jest',
                    name: 'Jest',
                    description: 'Testing framework setup with Jest',
                    category: 'testing'
                },
                {
                    id: 'typescript',
                    name: 'Enhanced TypeScript',
                    description: 'Strict TypeScript configuration with shared types',
                    category: 'development'
                },
                {
                    id: 'eslint',
                    name: 'ESLint',
                    description: 'Code linting with ESLint',
                    category: 'code-quality'
                },
                {
                    id: 'prettier',
                    name: 'Prettier',
                    description: 'Code formatting with Prettier',
                    category: 'code-quality'
                },
                {
                    id: 'github_actions',
                    name: 'GitHub Actions',
                    description: 'CI/CD pipeline with GitHub Actions',
                    category: 'ci-cd'
                }
            ],
            categories: [
                'version-control',
                'backend',
                'deployment',
                'testing',
                'development',
                'code-quality',
                'ci-cd'
            ]
        };
    }

    getPackageManagers(): PackageManagersData {
        return {
            packageManagers: [
                {
                    id: 'npm',
                    name: 'npm',
                    description: 'Node Package Manager (default)',
                    isDefault: true
                },
                {
                    id: 'yarn',
                    name: 'Yarn',
                    description: 'Fast, reliable, and secure dependency management'
                },
                {
                    id: 'pnpm',
                    name: 'pnpm',
                    description: 'Fast, disk space efficient package manager'
                }
            ]
        };
    }

    getNodeVersions(): NodeVersionsData {
        return {
            nodeVersions: [
                {
                    id: '18.x',
                    name: 'Node.js 18.x LTS',
                    description: 'Long Term Support version (recommended)',
                    isDefault: true
                },
                {
                    id: '20.x',
                    name: 'Node.js 20.x LTS',
                    description: 'Latest LTS version'
                },
                {
                    id: 'latest',
                    name: 'Latest',
                    description: 'Latest stable version'
                }
            ]
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