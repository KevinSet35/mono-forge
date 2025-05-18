import { ResponseStatus } from "@mono-forge/types";
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;

        response.status(status).json({
            status: ResponseStatus.ERROR,
            error: {
                code: status,
                message: exception.message || "Unexpected error occurred",
                details: exception.getResponse()?.["details"] ?? null,
            },
            meta: {
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        });
    }
}
