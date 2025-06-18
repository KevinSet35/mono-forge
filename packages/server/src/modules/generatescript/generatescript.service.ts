import {
    ScriptGeneratorInput,
    IntegrationType,
    AdvancedConfigType,
    ScriptGenerationData,
    IntegrationsListData,
    PackageManagersData,
    NodeVersionsData,
    ValidationData,
    ScriptGeneratorSchema
} from '@mono-forge/types';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

interface ScriptModule {
    name: string;
    content: string;
    path: string;
}

interface IntegrationConfig {
    modules: string[];
    dependencies?: string[];
    devDependencies?: string[];
    scripts?: Record<string, string>;
}

@Injectable()
export class ScriptGeneratorService {
    private readonly baseModules = [
        "init/00-validate-args.sh",
        "init/01-create-root.sh",
        "init/02-init-workspaces.sh",
        "client/node-react.sh",
        "server/nestjs.sh",
        "post/install-deps.sh",
        "post/gitignore-and-prettier.sh",
        "post/readme.sh"
    ];

    private readonly integrationConfigs: Record<IntegrationType, IntegrationConfig> = {
        git: {
            modules: ["integrations/git-setup.sh"],
            scripts: {
                "git:init": "git init && git add . && git commit -m 'Initial commit'"
            }
        },
        supabase: {
            modules: ["integrations/supabase-setup.sh"],
            dependencies: ["@supabase/supabase-js"],
            devDependencies: ["supabase"]
        },
        docker: {
            modules: ["integrations/docker-setup.sh"]
        },
        jest: {
            modules: ["integrations/jest-setup.sh"],
            devDependencies: ["jest", "@types/jest", "ts-jest"]
        },
        typescript: {
            modules: ["integrations/typescript-enhanced.sh"],
            devDependencies: ["typescript", "@types/node"]
        },
        eslint: {
            modules: ["integrations/eslint-setup.sh"],
            devDependencies: ["eslint", "@typescript-eslint/parser", "@typescript-eslint/eslint-plugin"]
        },
        prettier: {
            modules: ["integrations/prettier-setup.sh"],
            devDependencies: ["prettier"]
        },
        github_actions: {
            modules: ["integrations/github-actions-setup.sh"]
        }
    };

    /**
     * Generate script with full metadata and validation
     */
    async generateScriptWithData(scriptInput: ScriptGeneratorInput): Promise<ScriptGenerationData> {
        console.log('---ScriptInput:', scriptInput);

        try {
            // Validate input using the schema
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);

            console.log('Generating script with:', {
                projectName: validatedInput.projectName,
                integrations: validatedInput.integrations,
                advancedConfig: validatedInput.advancedConfig
            });

            const script = await this.generateScripts(validatedInput);
            console.log('script is:', script);

            // Return the complete data structure
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

    /**
     * Generate raw script string only
     */
    async generateScriptRaw(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('---ScriptInput_1:', scriptInput);

        try {
            // Validate input
            const validatedInput = ScriptGeneratorSchema.parse(scriptInput);
            return await this.generateScripts(validatedInput);
        } catch (error) {
            console.error('Script generation error:', error);
            throw new BadRequestException(
                error instanceof Error ? error.message : 'Failed to generate script'
            );
        }
    }

    /**
     * Get available integrations with categories
     */
    getAvailableIntegrations(): IntegrationsListData {
        console.log('---getAvailableIntegrations:');

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

    /**
     * Get available package managers
     */
    getPackageManagers(): PackageManagersData {
        console.log('---getPackageManagers:');

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

    /**
     * Get available Node.js versions
     */
    getNodeVersions(): NodeVersionsData {
        console.log('---getNodeVersions:');

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

    /**
     * Validate input data
     */
    validateInput(scriptInput: any): ValidationData {
        console.log('---validateInput:');

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

    /**
     * Core script generation logic (unchanged)
     */
    async generateScripts(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('Generating scripts with input:', scriptInput);

        try {
            const modules = this.buildModuleList(scriptInput.integrations || []);
            const moduleScripts = await this.readModuleScripts(modules);

            const fullScript = this.generateSelfContainedScript(
                'monorepo',
                moduleScripts,
                scriptInput.projectName,
                scriptInput.integrations || [],
                scriptInput.advancedConfig
            );
            return fullScript;
        } catch (error) {
            throw new NotFoundException(`Failed to generate scripts: ${error.message}`);
        }
    }

    private buildModuleList(integrations: IntegrationType[]): string[] {
        let modules = [...this.baseModules];

        integrations.forEach(integration => {
            const config = this.integrationConfigs[integration];
            if (config) {
                modules.push(...config.modules);
            }
        });

        return modules;
    }

    private async readModuleScripts(modulePaths: string[]): Promise<ScriptModule[]> {
        const modules: ScriptModule[] = [];

        for (const modulePath of modulePaths) {
            try {
                const fullPath = this.getFilePath(modulePath);
                let content = '';

                if (existsSync(fullPath)) {
                    content = await fs.readFile(fullPath, 'utf-8');
                } else {
                    content = this.generateMissingModule(modulePath);
                }

                const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

                modules.push({
                    name: fileName,
                    content: content.trim(),
                    path: modulePath
                });
            } catch (error) {
                const content = this.generateMissingModule(modulePath);
                const fileName = modulePath.substring(modulePath.lastIndexOf('/') + 1);

                modules.push({
                    name: fileName,
                    content: content.trim(),
                    path: modulePath
                });
            }
        }

        return modules;
    }

    private generateMissingModule(modulePath: string): string {
        const fileName = modulePath.substring(modulePath.lastIndexOf('/') + 1);
        const functionName = this.getFunctionNameFromFile(fileName);

        return `#!/bin/bash
# Integration script: ${fileName}
# This file should be created in src/scripts/${modulePath}

${functionName}() {
    echo "⚙️ Setting up ${fileName.replace('.sh', '').replace('-', ' ')}..."
    echo "✅ ${fileName.replace('.sh', '').replace('-', ' ')} setup complete"
}`;
    }

    private generateSelfContainedScript(
        templateName: string,
        modules: ScriptModule[],
        projectName?: string,
        integrations: IntegrationType[] = [],
        advancedConfig?: AdvancedConfigType
    ): string {
        const allFunctions = modules
            .map(module => this.extractFunctionDefinitions(module.content))
            .filter(funcDef => funcDef.trim().length > 0)
            .join('\n\n');

        const functionCalls = this.generateOrderedFunctionCalls(modules, integrations);
        const preconfiguredProjectName = projectName
            ? `PRECONFIGURED_PROJECT_NAME="${projectName}"`
            : 'PRECONFIGURED_PROJECT_NAME=""';

        const packageManager = advancedConfig?.packageManager || 'npm';
        const nodeVersion = advancedConfig?.nodeVersion || '18.x';

        const script = `#!/bin/bash

# ${templateName.toUpperCase()} Project Setup Script
# Self-contained script - no external dependencies required
# Usage: ./setup-project.sh [project-name]

set -e  # Exit on any error

# Pre-configured project name and settings
${preconfiguredProjectName}
PACKAGE_MANAGER="${packageManager}"
NODE_VERSION="${nodeVersion}"
SELECTED_INTEGRATIONS="${integrations.join(' ')}"

${allFunctions}

# Main execution flow
main() {
    echo "🚀 Starting \${PROJECT_NAME} project setup..."
    echo "📦 Package Manager: \${PACKAGE_MANAGER}"
    echo "🟢 Node Version: \${NODE_VERSION}"
    echo "🔧 Integrations: \${SELECTED_INTEGRATIONS}"
    
${functionCalls}
    
    echo "✅ \${PROJECT_NAME} project setup complete!"
    echo "🎉 Selected integrations have been configured"
}

# Run main function with all arguments
main "$@"`;

        return script;
    }

    private extractFunctionDefinitions(content: string): string {
        const lines = content.split('\n');
        const functionLines: string[] = [];
        let inFunction = false;
        let braceCount = 0;
        let currentFunction: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed.startsWith('#!')) {
                continue;
            }

            if (trimmed.startsWith('#') && !inFunction) {
                continue;
            }

            if (!inFunction && (trimmed.includes('() {') || trimmed.includes('){'))) {
                inFunction = true;
                braceCount = 0;
                currentFunction = [];
                currentFunction.push(line);

                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                continue;
            }

            if (inFunction) {
                currentFunction.push(line);

                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                if (braceCount === 0) {
                    functionLines.push(...currentFunction);
                    functionLines.push('');
                    inFunction = false;
                    currentFunction = [];
                }
            }
        }

        return functionLines.join('\n').trim();
    }

    private generateOrderedFunctionCalls(modules: ScriptModule[], integrations: IntegrationType[]): string {
        const baseFunctionMap: Record<string, string> = {
            '00-validate-args.sh': '    validate_arguments "$@"',
            '01-create-root.sh': '    create_root_directory',
            '02-init-workspaces.sh': '    init_workspaces',
            'node-react.sh': '    setup_react_client',
            'nestjs.sh': '    setup_nestjs_server',
            'install-deps.sh': '    install_root_dependencies',
            'gitignore-and-prettier.sh': '    create_config_files',
            'readme.sh': '    create_readme'
        };

        const integrationFunctionMap: Record<string, string> = {
            'git-setup.sh': '    setup_git',
            'supabase-setup.sh': '    setup_supabase',
            'docker-setup.sh': '    setup_docker',
            'jest-setup.sh': '    setup_jest',
            'typescript-enhanced.sh': '    setup_typescript_enhanced',
            'eslint-setup.sh': '    setup_eslint',
            'prettier-setup.sh': '    setup_prettier',
            'github-actions-setup.sh': '    setup_github_actions'
        };

        const calls = modules
            .map(module => {
                const fileName = this.getFileName(module.path);
                return baseFunctionMap[fileName] || integrationFunctionMap[fileName] || `    # TODO: Add function call for ${fileName}`;
            })
            .filter(call => !call.includes('TODO'));

        return calls.join('\n');
    }

    private getFunctionNameFromFile(fileName: string): string {
        return fileName.replace('.sh', '').replace(/-/g, '_');
    }

    private getFileName(modulePath: string): string {
        return modulePath.substring(modulePath.lastIndexOf('/') + 1);
    }

    private getFilePath(modulePath: string): string {
        const pathFromRoot = join(process.cwd(), 'packages', 'server', 'src', 'scripts', modulePath);
        const pathFromServer = join(process.cwd(), 'src', 'scripts', modulePath);

        if (existsSync(pathFromRoot)) {
            return pathFromRoot;
        } else if (existsSync(pathFromServer)) {
            return pathFromServer;
        } else {
            return pathFromServer; // Default to server path for missing files
        }
    }
}