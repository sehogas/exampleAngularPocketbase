import { HttpInterceptorFn } from "@angular/common/http";
import { LoaderService } from "../services/loader.service";
import { inject } from "@angular/core";
import { finalize } from "rxjs";

export const loaderInterceptor: HttpInterceptorFn = (request, next) => {
    const loaderService = inject(LoaderService);
    loaderService.isLoading.set(true);
    return next(request).pipe(
        finalize(() => {
            loaderService.isLoading.set(false);
        })
    );
}