// src/modules/generatescript/generatescript.controller.ts
import { Controller, Post, Body, BadRequestException, Get } from '@nestjs/common';
import {
    ScriptGeneratorInput,
    ScriptGeneratorSchema,
    ScriptGenerationData,
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData
} from '@mono-forge/types';
import { ScriptGeneratorService } from './template.service';

@Controller('generatescript')
export class GeneratescriptController {
    constructor(
        private readonly scriptGeneratorService: ScriptGeneratorService,
    ) { }

    @Post()
    async generateScript(@Body() scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        console.log('---ScriptInput:', scriptInput);
        try {
            // Validate input using the schema
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);

            console.log('Generating script with:', {
                projectName: validatedInput.projectName,
                integrations: validatedInput.integrations,
                advancedConfig: validatedInput.advancedConfig
            });

            const script = await this.scriptGeneratorService.generateScripts(validatedInput);
            console.log('script is:', script);

            // Return just the data - the interceptor will wrap it in ApiResponse
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
            console.error('Script generation error:', error);

            if (error.name === 'ZodError') {
                throw new BadRequestException({
                    message: 'Invalid input parameters',
                    details: error.errors
                });
            }

            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to generate script'
            );
        }
    }

    @Post('generate')
    async generateScriptRaw(@Body() scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('---ScriptInput_1:', scriptInput);
        try {
            // Validate input
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            return await this.scriptGeneratorService.generateScripts(validatedInput);
        } catch (error) {
            console.error('Script generation error:', error);
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to generate script'
            );
        }
    }

    @Get('integrations')
    getAvailableIntegrations(): IntegrationsListData {
        console.log('---getAvailableIntegrations:');
        // Return just the data - the interceptor will wrap it in ApiResponse
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

    @Get('package-managers')
    getPackageManagers(): PackageManagersData {
        console.log('---getPackageManagers:');
        // Return just the data - the interceptor will wrap it in ApiResponse
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

    @Get('node-versions')
    getNodeVersions(): NodeVersionsData {
        console.log('---getNodeVersions:');
        // Return just the data - the interceptor will wrap it in ApiResponse
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

    @Post('validate')
    validateInput(@Body() scriptInput: any): ValidationData {
        console.log('---validateInput:');
        try {
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            // Return just the data - the interceptor will wrap it in ApiResponse
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