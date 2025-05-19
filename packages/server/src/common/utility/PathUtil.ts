import { join } from 'path';

export class PathUtil {

    static getIndexHtmlPath(): string {
        return join(__dirname, '..', '..', '..', '..', '..', 'packages', 'client', 'build', 'index.html');
    }

    static getStaticAssetsPath(): string {
        return join(__dirname, '..', '..', '..', '..', '..', 'packages', 'client', 'build');
    }

}

