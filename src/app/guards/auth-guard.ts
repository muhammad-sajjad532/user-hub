import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Auth Guard
 * Protects routes from unauthorized access
 * Redirects to login if user is not authenticated
 * 
 * Usage in routes:
 * { path: 'dashboard', component: Dashboard, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    console.log('✅ Auth Guard: User authenticated, access granted');
    return true;
  }

  // User not authenticated, redirect to login
  console.log('❌ Auth Guard: User not authenticated, redirecting to login');
  console.log('Attempted URL:', state.url);
  
  // Store the attempted URL for redirecting after login
  sessionStorage.setItem('redirectUrl', state.url);
  
  // Redirect to login
  router.navigate(['/login']);
  return false;
};
