import { Routes } from '@angular/router';
import { Signup } from './signup/signup/signup';
import { Login } from './login/login/login';
import { Dashboard } from './dashboard/dashboard/dashboard';
import { Users } from './users/users/users';
import { authGuard } from './guards/auth-guard';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'signup', component: Signup },
    { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
    { path: 'users', component: Users, canActivate: [authGuard] },
    { path: '**', redirectTo: '/login' },
];
