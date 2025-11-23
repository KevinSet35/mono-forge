import { Injectable } from '@nestjs/common';
import { IntegrationType, AdvancedConfigType } from '@mono-forge/types';
import { ScriptModule } from '../../interfaces/script-module.interface';

@Injectable()
export class ScriptBuilderService {
    generateSelfContainedScript(
        templateName: string,
        modules: ScriptModule[],
        projectName?: string,
        integrations: IntegrationType[] = [],
        advancedConfig?: AdvancedConfigType
    ): string {
        const allFunctions = this.extractAllFunctions(modules);
        const functionCalls = this.generateOrderedFunctionCalls(modules, integrations);
        const scriptHeader = this.generateScriptHeader(templateName, projectName, integrations, advancedConfig);

        return `${scriptHeader}

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
    }

    private generateScriptHeader(
        templateName: string,
        projectName?: string,
        integrations: IntegrationType[] = [],
        advancedConfig?: AdvancedConfigType
    ): string {
        const preconfiguredProjectName = projectName
            ? `PRECONFIGURED_PROJECT_NAME="${projectName}"`
            : 'PRECONFIGURED_PROJECT_NAME=""';

        const packageManager = advancedConfig?.packageManager || 'npm';
        const nodeVersion = advancedConfig?.nodeVersion || '18.x';

        return `#!/bin/bash

# ${templateName.toUpperCase()} Project Setup Script
# Self-contained script - no external dependencies required
# Usage: ./setup-project.sh [project-name]

set -e  # Exit on any error

# Pre-configured project name and settings
${preconfiguredProjectName}
PACKAGE_MANAGER="${packageManager}"
NODE_VERSION="${nodeVersion}"
SELECTED_INTEGRATIONS="${integrations.join(' ')}"`;
    }

    private extractAllFunctions(modules: ScriptModule[]): string {
        return modules
            .map(module => this.extractFunctionDefinitions(module.content))
            .filter(funcDef => funcDef.trim().length > 0)
            .join('\n\n');
    }

    private extractFunctionDefinitions(content: string): string {
        const lines = content.split('\n');
        const functionLines: string[] = [];
        let inFunction = false;
        let braceCount = 0;
        let currentFunction: string[] = [];

        for (const line of lines) {
            const trimmed = line.trim();

            if (this.shouldSkipLine(trimmed, inFunction)) {
                continue;
            }

            if (!inFunction && this.isFunctionStart(trimmed)) {
                inFunction = true;
                braceCount = 0;
                currentFunction = [line];
                braceCount += this.countBraces(line, '{') - this.countBraces(line, '}');
                continue;
            }

            if (inFunction) {
                currentFunction.push(line);
                braceCount += this.countBraces(line, '{') - this.countBraces(line, '}');

                if (braceCount === 0) {
                    functionLines.push(...currentFunction, '');
                    inFunction = false;
                    currentFunction = [];
                }
            }
        }

        return functionLines.join('\n').trim();
    }

    private shouldSkipLine(trimmed: string, inFunction: boolean): boolean {
        return trimmed.startsWith('#!') || (trimmed.startsWith('#') && !inFunction);
    }

    private isFunctionStart(trimmed: string): boolean {
        return trimmed.includes('() {') || trimmed.includes('){');
    }

    private countBraces(line: string, brace: string): number {
        return (line.match(new RegExp(`\\${brace}`, 'g')) || []).length;
    }

    private generateOrderedFunctionCalls(modules: ScriptModule[], integrations: IntegrationType[]): string {
        const baseFunctionMap = this.getBaseFunctionMap();
        const integrationFunctionMap = this.getIntegrationFunctionMap();

        const calls = modules
            .map(module => {
                const fileName = this.extractFileName(module.path);
                return baseFunctionMap[fileName] || integrationFunctionMap[fileName];
            })
            .filter(Boolean);

        return calls.join('\n');
    }

    private getBaseFunctionMap(): Record<string, string> {
        return {
            '00-validate-args.sh': '    validate_arguments "$@"',
            '01-create-root.sh': '    create_root_directory',
            '02-init-workspaces.sh': '    init_workspaces',
            'node-react.sh': '    setup_react_client',
            'nestjs.sh': '    setup_nestjs_server',
            'install-deps.sh': '    install_root_dependencies',
            'gitignore-and-prettier.sh': '    create_config_files',
            'readme.sh': '    create_readme'
        };
    }

    private getIntegrationFunctionMap(): Record<string, string> {
        return {
            'git-setup.sh': '    setup_git',
            'supabase-setup.sh': '    setup_supabase',
            'docker-setup.sh': '    setup_docker',
            'jest-setup.sh': '    setup_jest',
            'typescript-enhanced.sh': '    setup_typescript_enhanced',
            'eslint-setup.sh': '    setup_eslint',
            'prettier-setup.sh': '    setup_prettier',
            'github-actions-setup.sh': '    setup_github_actions'
        };
    }

    private extractFileName(path: string): string {
        return path.substring(path.lastIndexOf('/') + 1);
    }
}