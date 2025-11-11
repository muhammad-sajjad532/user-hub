import { Routes } from '@angular/router';
import { Signup } from './components/signup/signup/signup';
import { Login } from './components/login/login/login';
import { Dashboard } from './components/dashboard/dashboard/dashboard';
import { Students } from './components/students/students/students';
import { Teachers } from './components/teachers/teachers/teachers';
import { Settings } from './components/settings/settings/settings';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

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

  // School Management Routes (Role-based access)
  {
    path: 'students',
    component: Students,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'manager', 'user'] } // Guests cannot access
  },
  {
    path: 'teachers',
    component: Teachers,
    canActivate: [roleGuard],
    data: { roles: ['admin', 'manager', 'user'] }
  },
  {
    path: 'classes',
    redirectTo: '/students',
    pathMatch: 'full'
  },
  {
    path: 'attendance',
    redirectTo: '/students',
    pathMatch: 'full'
  },
  {
    path: 'fees',
    redirectTo: '/students',
    pathMatch: 'full'
  },

  // Settings (any authenticated user)
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard]
  },

  // Catch-all redirect
  { path: '**', redirectTo: '/login' },
];
