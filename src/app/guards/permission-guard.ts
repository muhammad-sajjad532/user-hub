import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService, Permission } from '../services/auth';

/**
 * Permission Guard
 * Protects routes based on user permissions
 * Most granular access control
 * 
 * Usage in routes:
 * { 
 *   path: 'users/delete', 
 *   component: DeleteUser, 
 *   canActivate: [permissionGuard],
 *   data: { permissions: ['delete', 'manage_users'] }
 * }
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    console.log('❌ Permission Guard: User not authenticated');
    router.navigate(['/login']);
    return false;
  }

  // Get required permissions from route data
  const requiredPermissions = route.data['permissions'] as Permission[];
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    // No specific permissions required
    console.log('✅ Permission Guard: No specific permissions required, access granted');
    return true;
  }

  // Check if user has all required permissions
  const hasAccess = authService.hasAllPermissions(requiredPermissions);

  if (hasAccess) {
    console.log(`✅ Permission Guard: User has all required permissions [${requiredPermissions.join(', ')}]`);
    return true;
  }

  // User doesn't have required permissions
  const userPermissions = authService.currentUserValue?.permissions || [];
  console.log(`❌ Permission Guard: User permissions [${userPermissions.join(', ')}] don't match required [${requiredPermissions.join(', ')}]`);
  console.log('Redirecting to dashboard (insufficient permissions)');
  
  // Redirect to dashboard with error message
  router.navigate(['/dashboard'], { 
    queryParams: { error: 'insufficient_permissions' } 
  });
  return false;
};
