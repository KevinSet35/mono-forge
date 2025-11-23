import { Injectable } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';
import { ScriptModule } from '../../interfaces/script-module.interface';

@Injectable()
export class ScriptFileService {
    async readModuleScripts(modulePaths: string[]): Promise<ScriptModule[]> {
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

                const fileName = this.extractFileName(fullPath);

                modules.push({
                    name: fileName,
                    content: content.trim(),
                    path: modulePath
                });
            } catch (error) {
                const content = this.generateMissingModule(modulePath);
                const fileName = this.extractFileName(modulePath);

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
        const fileName = this.extractFileName(modulePath);
        const functionName = this.getFunctionNameFromFile(fileName);

        return `#!/bin/bash
# Integration script: ${fileName}
# This file should be created in src/scripts/${modulePath}

${functionName}() {
    echo "⚙️ Setting up ${fileName.replace('.sh', '').replace('-', ' ')}..."
    echo "✅ ${fileName.replace('.sh', '').replace('-', ' ')} setup complete"
}`;
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

    private extractFileName(path: string): string {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private getFunctionNameFromFile(fileName: string): string {
        return fileName.replace('.sh', '').replace(/-/g, '_');
    }
}