import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading';

/**
 * Loading Interceptor
 * Shows loading spinner during HTTP requests
 * 
 * How it works:
 * 1. Shows loading spinner when request starts
 * 2. Hides loading spinner when request completes (success or error)
 * 3. Handles multiple concurrent requests (only hides when all complete)
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Show loading spinner
  loadingService.show();

  // Pass request and hide spinner when done
  return next(req).pipe(
    finalize(() => {
      // This runs whether request succeeds or fails
      loadingService.hide();
    })
  );
};
