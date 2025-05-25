import { ScriptGeneratorInput } from '@mono-forge/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

// Define the template configuration interface
interface ScriptTemplate {
    name: string;
    modules: string[];
}

// Define the response interface
interface ScriptModule {
    name: string;
    content: string;
    path: string;
}

// interface GeneratedScript {
//     templateName: string;
//     mainScript: string;
//     modules: ScriptModule[];
//     fullScript?: string; // Optional: concatenated version
// }

@Injectable()
export class ScriptGeneratorService {
    // Your default template
    private readonly defaultTemplate: ScriptTemplate = {
        name: "monorepo",
        modules: [
            "init/00-validate-args.sh",
            "init/01-create-root.sh",
            "init/02-init-workspaces.sh",
            "client/node-react.sh",
            "server/nestjs.sh",
            "post/install-deps.sh",
            "post/gitignore-and-prettier.sh",
            "post/readme.sh"
        ]
    };

    // Update your main generateScripts method to accept project name
    async generateScripts(scriptInput: ScriptGeneratorInput): Promise<string> {
        console.log('In generateScripts service');
        const config = this.defaultTemplate;

        try {
            // Read all module scripts
            const modules = await this.readModuleScripts(config.modules);

            // Generate a truly self-contained script with optional project name
            const projectName = scriptInput.projectName || undefined; // Get project name from input
            const fullScript = this.generateSelfContainedScript(config.name, modules, projectName);

            return fullScript;
        } catch (error) {
            throw new NotFoundException(`Failed to generate scripts: ${error.message}`);
        }
    }

    /**
     * Read individual module script files
     */
    private async readModuleScripts(modulePaths: string[]): Promise<ScriptModule[]> {
        const modules: ScriptModule[] = [];

        for (const modulePath of modulePaths) {
            try {
                const fullPath = this.getFilePath(modulePath);
                const content = await fs.readFile(fullPath, 'utf-8');

                // Extract just the filename for the name
                const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

                modules.push({
                    name: fileName,
                    content: content.trim(),
                    path: modulePath
                });
            } catch (error) {
                throw new Error(`Failed to read module ${modulePath}: ${error.message}`);
            }
        }

        return modules;
    }

    /**
     * Generate a truly self-contained bash script with configurable project name
     */
    private generateSelfContainedScript(templateName: string, modules: ScriptModule[], projectName?: string): string {
        // Extract all function definitions from modules (remove shebang and comments)
        const allFunctions = modules
            .map(module => this.extractFunctionDefinitions(module.content))
            .filter(funcDef => funcDef.trim().length > 0) // Remove empty definitions
            .join('\n\n');

        // Generate function calls in the correct order
        const functionCalls = this.generateOrderedFunctionCalls(modules);

        // Set the preconfigured project name if provided
        const preconfiguredProjectName = projectName ? `PRECONFIGURED_PROJECT_NAME="${projectName}"` : 'PRECONFIGURED_PROJECT_NAME=""';

        const script = `#!/bin/bash

# ${templateName.toUpperCase()} Project Setup Script
# Self-contained script - no external dependencies required
# Usage: ./setup-project.sh [project-name]

set -e  # Exit on any error

# Pre-configured project name (can be set by the generator)
${preconfiguredProjectName}

${allFunctions}

# Main execution flow
main() {
    echo "🚀 Starting \${PROJECT_NAME} project setup..."
    
${functionCalls}
    
    echo "✅ \${PROJECT_NAME} project setup complete with client-server integration and health check!"
}

# Run main function with all arguments
main "$@"`;

        return script;
    }

    /**
     * Extract only function definitions from script content
     * Removes shebang, standalone comments, and source statements
     */
    private extractFunctionDefinitions(content: string): string {
        const lines = content.split('\n');
        const functionLines: string[] = [];
        let inFunction = false;
        let braceCount = 0;
        let currentFunction: string[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip shebang lines
            if (trimmed.startsWith('#!')) {
                continue;
            }

            // Skip standalone comments (but keep comments inside functions)
            if (trimmed.startsWith('#') && !inFunction) {
                continue;
            }

            // Detect function start (function_name() { or function_name(){)
            if (!inFunction && (trimmed.includes('() {') || trimmed.includes('){'))) {
                inFunction = true;
                braceCount = 0;
                currentFunction = [];
                currentFunction.push(line);

                // Count braces in the same line
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                continue;
            }

            // If we're inside a function, collect all lines
            if (inFunction) {
                currentFunction.push(line);

                // Count braces to detect function end
                braceCount += (line.match(/{/g) || []).length;
                braceCount -= (line.match(/}/g) || []).length;

                // Function ends when brace count reaches 0
                if (braceCount === 0) {
                    // Add the complete function to our collection
                    functionLines.push(...currentFunction);
                    functionLines.push(''); // Add empty line between functions
                    inFunction = false;
                    currentFunction = [];
                }
            }
        }

        return functionLines.join('\n').trim();
    }

    /**
     * Generate function calls in the correct order based on module paths
     */
    private generateOrderedFunctionCalls(modules: ScriptModule[]): string {
        const functionMap: Record<string, string> = {
            '00-validate-args.sh': '    validate_arguments "$@"',
            '01-create-root.sh': '    create_root_directory',
            '02-init-workspaces.sh': '    init_workspaces',
            'node-react.sh': '    setup_react_client',
            'nestjs.sh': '    setup_nestjs_server',
            'install-deps.sh': '    install_root_dependencies',
            'gitignore-and-prettier.sh': '    create_config_files',
            'readme.sh': '    create_readme'
        };

        return modules
            .map(module => {
                const fileName = this.getFileName(module.path);
                return functionMap[fileName] || `    # TODO: Add function call for ${fileName}`;
            })
            .join('\n');
    }



    private getFileName(modulePath: string): string {
        return modulePath.substring(modulePath.lastIndexOf('/') + 1);
    }

    private getFilePath(modulePath: string): string {
        // Define potential paths - from root and from server directory
        const pathFromRoot = join(
            process.cwd(),
            'packages',
            'server',
            'src',
            'scripts',
        );

        const pathFromServer = join(
            process.cwd(),
            'src',
            'scripts',
        );

        let path = '';

        // Check which path exists and use that one
        if (existsSync(pathFromRoot)) {
            path = pathFromRoot;
            console.log(`Found script at root path: ${path}`);
        } else if (existsSync(pathFromServer)) {
            path = pathFromServer;
            console.log(`Found script at server path: ${path}`);
        } else {
            // Throw an error if the script is not found in either location
            const errorMessage = `Script not found! Checked:\n1. ${pathFromRoot}\n2. ${pathFromServer}\nMake sure the script exists at one of these locations.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }

        return `${path}/${modulePath}`;
    }
}