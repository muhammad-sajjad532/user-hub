import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

/**
 * Auth Interceptor
 * Automatically adds authentication token to all HTTP requests
 * 
 * How it works:
 * 1. Intercepts every HTTP request
 * 2. Checks if user is authenticated
 * 3. Adds Authorization header with token
 * 4. Passes request to next handler
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    const user = authService.currentUserValue;
    
    // In real app, you'd have a token
    // For now, we'll add user email as a simple auth header
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user?.email}`,
        'X-User-Email': user?.email || ''
      }
    });

    console.log('🔐 Auth Interceptor: Added auth headers to request', req.url);
    return next(authReq);
  }

  // No authentication, pass request as-is
  console.log('🔓 Auth Interceptor: No auth, passing request as-is', req.url);
  return next(req);
};
