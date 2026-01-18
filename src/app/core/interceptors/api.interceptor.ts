import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for translation files and other asset requests
  if (req.url.startsWith('/assets/') || req.url.startsWith('assets/')) {
    return next(req);
  }

  const apiReq = req.clone({ url: `https://api.realworld.show/api${req.url}` });
  return next(apiReq);
};
