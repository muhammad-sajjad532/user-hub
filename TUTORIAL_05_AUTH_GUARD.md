# 🛡️ Tutorial 05: Auth Guard - Route Protection

## 📍 File Location: `src/app/guards/auth-guard.ts`

Guard ek **security layer** hai jo routes ko unauthorized access se protect karta hai.

---

## 🎯 What is a Guard?

**Real-life analogy:** School ka security guard
- Sirf authorized students ko andar jane deta hai
- ID card check karta hai
- Agar ID nahi hai, to entry deny kar deta hai

**Angular Guard:**
- Routes ko protect karta hai
- User authentication check karta hai
- Unauthorized users ko redirect karta hai

---

## 🔍 Complete Code with Line-by-Line Explanation

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';
```

### 📝 Imports Explanation:

#### **`inject`**
```typescript
import { inject } from '@angular/core';
```
- Functional approach for dependency injection
- Modern Angular feature (v14+)
- Alternative to constructor injection

**Old vs New:**
```typescript
// ❌ Old way (Class-based guard)
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate() {
    // ...
  }
}

// ✅ New way (Functional guard)
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // ...
};
```

#### **`CanActivateFn`**
```typescript
import { Router, CanActivateFn } from '@angular/router';
```
- Type definition for functional guards
- Ensures correct function signature

**Type signature:**
```typescript
type CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree>;
```

---

## 🔐 Guard Function

```typescript
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
```

### 📝 Line-by-Line Breakdown:

#### **Line 1: Function signature**
```typescript
export const authGuard: CanActivateFn = (route, state) => {
```

**Parameters:**
- `route`: Current route information
- `state`: Router state (URL, params, etc.)

**Example values:**
```typescript
// User tries to access: /dashboard
route = {
  url: [{ path: 'dashboard' }],
  params: {},
  data: {},
  // ... more properties
}

state = {
  url: '/dashboard',
  root: { /* ... */ }
}
```

#### **Line 2-3: Inject dependencies**
```typescript
const authService = inject(AuthService);
const router = inject(Router);
```

**`inject()` function:**
- Gets service instance from Angular's DI system
- Must be called in injection context
- Cleaner than constructor injection for functions

**Equivalent class-based code:**
```typescript
constructor(
  private authService: AuthService,
  private router: Router
) {}
```

#### **Line 5-8: Authentication check**
```typescript
if (authService.isAuthenticated()) {
  console.log('✅ Auth Guard: User authenticated, access granted');
  return true;
}
```

**`return true`**: Allow navigation
- User can access the route
- Component will load

**Flow:**
```
User clicks "Dashboard"
        ↓
Guard executes
        ↓
Check: isAuthenticated()?
        ↓
    YES (true)
        ↓
Allow access
        ↓
Dashboard loads
```

#### **Line 10-12: Log unauthorized attempt**
```typescript
console.log('❌ Auth Guard: User not authenticated, redirecting to login');
console.log('Attempted URL:', state.url);
```

**Why log?**
- Debugging
- Security monitoring
- User behavior tracking

**Console output:**
```
❌ Auth Guard: User not authenticated, redirecting to login
Attempted URL: /dashboard
```

#### **Line 14-15: Store redirect URL**
```typescript
sessionStorage.setItem('redirectUrl', state.url);
```

### 💡 sessionStorage vs localStorage

**sessionStorage:**
- Data persists only for current tab/session
- Closes when tab closes
- More secure for temporary data

**localStorage:**
- Data persists permanently
- Survives browser restart
- Good for long-term data

**Example:**
```typescript
// Save
sessionStorage.setItem('redirectUrl', '/dashboard');

// Get
const url = sessionStorage.getItem('redirectUrl');  // '/dashboard'

// Remove
sessionStorage.removeItem('redirectUrl');

// Clear all
sessionStorage.clear();
```

**Why store redirect URL?**
```
User tries to access: /dashboard
        ↓
Not logged in
        ↓
Redirect to: /login
        ↓
User logs in
        ↓
Redirect back to: /dashboard (stored URL)
```

**Implementation in login component:**
```typescript
// After successful login
login(username: string, password: string) {
  if (this.authService.login(username, password)) {
    // Get stored URL
    const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
    
    // Clear stored URL
    sessionStorage.removeItem('redirectUrl');
    
    // Navigate to original destination
    this.router.navigate([redirectUrl]);
  }
}
```

#### **Line 17-18: Redirect to login**
```typescript
router.navigate(['/login']);
return false;
```

**`return false`**: Block navigation
- User cannot access the route
- Navigation is cancelled

**Flow:**
```
User clicks "Dashboard"
        ↓
Guard executes
        ↓
Check: isAuthenticated()?
        ↓
    NO (false)
        ↓
Block access
        ↓
Redirect to login
        ↓
Login page loads
```

---

## 🗺️ Using Guard in Routes

### Route Configuration:

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  // Public routes (no guard)
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  
  // Protected routes (with guard)
  { 
    path: 'dashboard', 
    component: Dashboard,
    canActivate: [authGuard]  // ← Guard applied
  },
  { 
    path: 'students', 
    component: Students,
    canActivate: [authGuard]
  },
  { 
    path: 'teachers', 
    component: Teachers,
    canActivate: [authGuard]
  },
  
  // Protect multiple child routes
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      { path: 'users', component: Users },
      { path: 'settings', component: Settings }
    ]
  }
];
```

### 🎯 Guard Types:

#### **1. CanActivate** (Current)
```typescript
// Protects route activation
canActivate: [authGuard]
```
- Checks before entering route
- Most common guard type

#### **2. CanActivateChild**
```typescript
// Protects child routes
canActivateChild: [authGuard]
```
- Checks before entering child routes
- Parent route can be accessed

#### **3. CanDeactivate**
```typescript
// Checks before leaving route
canDeactivate: [unsavedChangesGuard]
```
- Prevents accidental navigation
- "Are you sure?" dialogs

**Example:**
```typescript
export const unsavedChangesGuard: CanDeactivateFn<any> = (component) => {
  if (component.hasUnsavedChanges()) {
    return confirm('You have unsaved changes. Leave anyway?');
  }
  return true;
};
```

#### **4. CanLoad**
```typescript
// Prevents lazy loading
canLoad: [authGuard]
```
- Checks before loading module
- Prevents downloading code

#### **5. Resolve**
```typescript
// Pre-fetch data before route activation
resolve: { student: studentResolver }
```
- Loads data before component
- Component receives data immediately

---

## 🔄 Guard Execution Flow

### Scenario: User tries to access protected route

```
1. User clicks link/button
   ↓
2. Router starts navigation
   ↓
3. Guard executes
   ↓
4. Check authentication
   ↓
   ├─ Authenticated?
   │  ├─ YES → return true
   │  │         ↓
   │  │      Allow navigation
   │  │         ↓
   │  │      Component loads
   │  │
   │  └─ NO → return false
   │            ↓
   │         Block navigation
   │            ↓
   │         Redirect to login
   │            ↓
   │         Login page loads
```

### Multiple Guards:

```typescript
{
  path: 'admin',
  canActivate: [authGuard, roleGuard, permissionGuard]
}
```

**Execution order:**
1. authGuard → Check if logged in
2. roleGuard → Check if admin role
3. permissionGuard → Check specific permissions

**All must return `true` for access**

---

## 🎨 Advanced Guard Patterns

### 1. Role-Based Guard

```typescript
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRole = route.data['role'];  // Get from route data
  const userRole = authService.getUserRole();
  
  if (userRole === requiredRole) {
    return true;
  }
  
  router.navigate(['/unauthorized']);
  return false;
};

// Usage:
{
  path: 'admin',
  component: Admin,
  canActivate: [authGuard, roleGuard],
  data: { role: 'admin' }  // ← Required role
}
```

### 2. Permission-Based Guard

```typescript
export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredPermissions = route.data['permissions'];
  const userPermissions = authService.getUserPermissions();
  
  const hasPermission = requiredPermissions.every(
    (perm: string) => userPermissions.includes(perm)
  );
  
  if (hasPermission) {
    return true;
  }
  
  router.navigate(['/forbidden']);
  return false;
};

// Usage:
{
  path: 'students/delete',
  component: DeleteStudent,
  canActivate: [authGuard, permissionGuard],
  data: { permissions: ['delete_student', 'manage_students'] }
}
```

### 3. Async Guard (API Check)

```typescript
export const apiAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Return Observable
  return authService.validateToken().pipe(
    map(isValid => {
      if (isValid) {
        return true;
      }
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
```

---

## 🎓 Key Concepts Learned

1. ✅ **Guards** - Route protection
2. ✅ **CanActivateFn** - Functional guard type
3. ✅ **inject()** - Modern DI
4. ✅ **sessionStorage** - Temporary storage
5. ✅ **Router navigation** - Programmatic routing
6. ✅ **Return values** - true/false for access control
7. ✅ **Route data** - Passing data to guards
8. ✅ **Multiple guards** - Chaining guards

---

## 📝 Practice Exercise

Create these guards:

### 1. Guest Guard (Opposite of Auth Guard)
```typescript
// Allows only non-authenticated users
// Use for login/signup pages
export const guestGuard: CanActivateFn = (route, state) => {
  // If logged in, redirect to dashboard
  // If not logged in, allow access
};
```

### 2. Admin Guard
```typescript
// Allows only admin users
export const adminGuard: CanActivateFn = (route, state) => {
  // Check if user role is 'admin'
  // If yes, allow
  // If no, redirect to unauthorized page
};
```

### 3. Subscription Guard
```typescript
// Check if user has active subscription
export const subscriptionGuard: CanActivateFn = (route, state) => {
  // Check subscription status from API
  // If active, allow
  // If expired, redirect to payment page
};
```

---

**Next Tutorial:** HTTP Interceptor - Loading State 🚀
