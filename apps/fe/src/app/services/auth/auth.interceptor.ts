import { HttpInterceptorFn } from '@angular/common/http';

// Interceptor ensures cookies are sent with API requests; no Authorization header needed
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const reqWithCreds = req.clone({ withCredentials: true });
  return next(reqWithCreds);
};
