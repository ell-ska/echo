import { inject } from '@angular/core';
import {
  type HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const accessToken = authService.getAccessToken();

  if (accessToken) {
    req.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        (error.status === 401 || error.status === 403) &&
        !req.headers.has('X-Retry')
      ) {
        return from(authService.refresh()).pipe(
          switchMap(() => {
            const accessToken = authService.getAccessToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${accessToken}`,
                'X-Retry': 'true',
              },
            });
            return next(retryReq);
          }),
          catchError((error) => {
            return throwError(() => error);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
