import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { IBaseResponse, ResponseStatus } from "../types/types";

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, IBaseResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IBaseResponse<T>> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();

        return next.handle().pipe(
            map((data) => ({
                status: ResponseStatus.SUCCESS,
                data,
                meta: {
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                },
            })),
        );
    }
}
