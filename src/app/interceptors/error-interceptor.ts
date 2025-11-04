import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Error Interceptor
 * Handles HTTP errors globally
 * 
 * Error Types:
 * - 401 Unauthorized: Redirect to login
 * - 403 Forbidden: Show access denied message
 * - 404 Not Found: Show not found message
 * - 500 Server Error: Show server error message
 * - Network Error: Show network error message
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network Error: ${error.error.message}`;
        console.error('❌ Client-side error:', error.error.message);
      } else {
        // Backend error
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            console.error('❌ 401 Unauthorized');
            // Clear auth and redirect to login
            localStorage.removeItem('currentUser');
            router.navigate(['/login']);
            break;

          case 403:
            errorMessage = 'Access denied. You don\'t have permission.';
            console.error('❌ 403 Forbidden');
            break;

          case 404:
            errorMessage = 'Resource not found.';
            console.error('❌ 404 Not Found:', req.url);
            break;

          case 500:
            errorMessage = 'Server error. Please try again later.';
            console.error('❌ 500 Server Error');
            break;

          case 0:
            errorMessage = 'Cannot connect to server. Please check if the API is running.';
            console.error('❌ Network Error: API server not reachable');
            break;

          default:
            errorMessage = `Error ${error.status}: ${error.message}`;
            console.error(`❌ HTTP Error ${error.status}:`, error.message);
        }
      }

      // Show error to user (you can replace with a toast/snackbar service)
      // alert(errorMessage);

      // Log for debugging
      console.error('Error Interceptor:', {
        url: req.url,
        status: error.status,
        message: errorMessage,
        error: error
      });

      // Re-throw error so components can handle it
      return throwError(() => new Error(errorMessage));
    })
  );
};
