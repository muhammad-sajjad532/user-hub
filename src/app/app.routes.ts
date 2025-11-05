import { Routes } from '@angular/router';
import { Signup } from './signup/signup/signup';
import { Login } from './login/login/login';
import { Dashboard } from './dashboard/dashboard/dashboard';
import { Users } from './users/users/users';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { permissionGuard } from './guards/permission-guard';

/**
 * Application Routes with Role-Based Access Control
 * 
 * Access Levels:
 * - Public: login, signup
 * - Authenticated: dashboard (any logged-in user)
 * - Role-based: users (admin, manager, user only - guests blocked)
 * - Permission-based: Can be added for specific actions
 */
export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    
    // Public routes
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    
    // Authenticated routes (any logged-in user)
    { 
      path: 'dashboard', 
      component: Dashboard, 
      canActivate: [authGuard] 
    },
    
    // Role-based routes (admin, manager, user only - guests cannot access)
    { 
      path: 'users', 
      component: Users, 
      canActivate: [roleGuard],
      data: { roles: ['admin', 'manager', 'user'] }
    },
    
    // Catch-all redirect
    { path: '**', redirectTo: '/login' },
];
