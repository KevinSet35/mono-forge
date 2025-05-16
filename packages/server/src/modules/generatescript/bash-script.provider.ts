// src/modules/generatescript/bash-script.provider.ts
import { join } from 'path';
import { existsSync } from 'fs';

export class BashScriptPathProvider {
    private readonly path: string;

    constructor() {
        // Define potential paths - from root and from server directory
        const pathFromRoot = join(
            process.cwd(),
            'packages',
            'server',
            'src',
            'scripts',
            'setup-mono-forge.sh'
        );

        const pathFromServer = join(
            process.cwd(),
            'src',
            'scripts',
            'setup-mono-forge.sh'
        );

        // Check which path exists and use that one
        if (existsSync(pathFromRoot)) {
            this.path = pathFromRoot;
            console.log(`Found script at root path: ${this.path}`);
        } else if (existsSync(pathFromServer)) {
            this.path = pathFromServer;
            console.log(`Found script at server path: ${this.path}`);
        } else {
            // Throw an error if the script is not found in either location
            const errorMessage = `Script not found! Checked:\n1. ${pathFromRoot}\n2. ${pathFromServer}\nMake sure the script exists at one of these locations.`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    getPath(): string {
        return this.path;
    }
}