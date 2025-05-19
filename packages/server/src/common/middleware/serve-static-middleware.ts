import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PathUtil } from '../utility/PathUtil';


@Injectable()
export class ServeStaticMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        if (req.originalUrl.startsWith('/api')) {
            next();
        } else {
            res.sendFile(PathUtil.getIndexHtmlPath());
        }
    }
}
