import { join } from 'path';

export class PathUtil {

    static getIndexHtmlPath(): string {
        const indexHtmlPath = join(__dirname, '..', '..', '..', '..', '..', 'packages', 'client', 'build', 'index.html');
        console.log(`indexHtmlPath: ${indexHtmlPath}`);
        return indexHtmlPath;
    }

    static getStaticAssetsPath(): string {
        const staticAssetsPath = join(__dirname, '..', '..', '..', '..', '..', 'packages', 'client', 'build');
        console.log(`staticAssetsPath: ${staticAssetsPath}`);
        return staticAssetsPath;
    }

}

