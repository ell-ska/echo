import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  const leadingAndTrailingSlashRegex = /^\/|\/$/g;

  const apiReq = req.clone({
    url: `${environment.serverUrl.replace(leadingAndTrailingSlashRegex, '')}/${req.url.replace(leadingAndTrailingSlashRegex, '')}`,
    withCredentials: true,
  });
  return next(apiReq);
};
