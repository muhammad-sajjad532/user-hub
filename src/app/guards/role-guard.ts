import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, UserRole } from '../services/auth';

/**
 * Role Guard
 * Protects routes based on user roles
 * More advanced than authGuard - checks specific roles
 * 
 * Usage in routes:
 * { 
 *   path: 'admin', 
 *   component: AdminPanel, 
 *   canActivate: [roleGuard],
 *   data: { roles: ['admin'] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('❌ Role Guard: User not authenticated');
    router.navigate(['/login']);
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as UserRole[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    // No specific roles required, just authentication
    console.log('✅ Role Guard: No specific roles required, access granted');
    return true;
  }

  // Check if user has any of the required roles
  const userRole = authService.getUserRole();
  const hasAccess = requiredRoles.includes(userRole!);

  if (hasAccess) {
    console.log(`✅ Role Guard: User has required role (${userRole}), access granted`);
    return true;
  }

  // User doesn't have required role
  console.log(`❌ Role Guard: User role (${userRole}) not in required roles [${requiredRoles.join(', ')}]`);
  console.log('Redirecting to dashboard (access denied)');
  
  // Redirect to dashboard with error message
  router.navigate(['/dashboard'], { 
    queryParams: { error: 'access_denied' } 
  });
  return false;
};
