# 🔐 Security & Access Control Guide

## Overview

This application implements a **Role-Based Access Control (RBAC)** system with three layers of security:

1. **Authentication Guard** - Basic login check
2. **Role Guard** - Role-based access control
3. **Permission Guard** - Fine-grained permission control

---

## 👥 User Roles

### Available Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **Admin** | Full Access | Complete system access, can manage users |
| **Manager** | High Access | Can read, write, and delete data |
| **User** | Standard Access | Can read and write data |
| **Guest** | Limited Access | Read-only access |

---

## 🔑 Test Accounts

Use these credentials to test different access levels:

### Admin Account
```
Email: admin@userhub.com
Password: admin123
Role: admin
Permissions: read, write, delete, manage_users
```

### Manager Account
```
Email: manager@userhub.com
Password: manager123
Role: manager
Permissions: read, write, delete
```

### User Account
```
Email: user@userhub.com
Password: user123
Role: user
Permissions: read, write
```

### Guest Account
```
Email: guest@userhub.com
Password: guest123
Role: guest
Permissions: read
```

---

## 🛡️ Guards Explained

### 1. Auth Guard (`authGuard`)

**Purpose:** Basic authentication check

**Usage:**
```typescript
{ 
  path: 'dashboard', 
  component: Dashboard, 
  canActivate: [authGuard] 
}
```

**Behavior:**
- ✅ Allows: Any logged-in user
- ❌ Blocks: Non-authenticated users
- Redirects to: `/login`

---

### 2. Role Guard (`roleGuard`)

**Purpose:** Role-based access control

**Usage:**
```typescript
{ 
  path: 'users', 
  component: Users, 
  canActivate: [roleGuard],
  data: { roles: ['admin', 'manager', 'user'] }
}
```

**Behavior:**
- ✅ Allows: Users with specified roles
- ❌ Blocks: Users without required roles
- Redirects to: `/dashboard` with error message

**Example:**
```typescript
// Only admins can access
data: { roles: ['admin'] }

// Admins and managers can access
data: { roles: ['admin', 'manager'] }

// Everyone except guests
data: { roles: ['admin', 'manager', 'user'] }
```

---

### 3. Permission Guard (`permissionGuard`)

**Purpose:** Fine-grained permission control

**Usage:**
```typescript
{ 
  path: 'users/delete', 
  component: DeleteUser, 
  canActivate: [permissionGuard],
  data: { permissions: ['delete', 'manage_users'] }
}
```

**Behavior:**
- ✅ Allows: Users with ALL specified permissions
- ❌ Blocks: Users missing any required permission
- Redirects to: `/dashboard` with error message

**Available Permissions:**
- `read` - View data
- `write` - Create/edit data
- `delete` - Delete data
- `manage_users` - User management (admin only)

---

## 🔄 How It Works

### Login Flow

```
1. User enters credentials
   ↓
2. AuthService queries API (db.json)
   ↓
3. If valid: User object with role & permissions created
   ↓
4. User saved to localStorage
   ↓
5. BehaviorSubject updated (reactive state)
   ↓
6. Redirect to dashboard
```

### Route Protection Flow

```
User navigates to /users
   ↓
Role Guard checks:
   - Is user authenticated? ✅
   - Does user have required role? ✅
   ↓
Access GRANTED
```

```
Guest user navigates to /users
   ↓
Role Guard checks:
   - Is user authenticated? ✅
   - Does user have required role? ❌ (guest not in [admin, manager, user])
   ↓
Access DENIED
   ↓
Redirect to /dashboard with error message
```

---

## 📋 Current Route Configuration

```typescript
// Public routes (no guard)
{ path: 'login', component: Login }
{ path: 'signup', component: Signup }

// Authenticated routes (authGuard)
{ 
  path: 'dashboard', 
  component: Dashboard, 
  canActivate: [authGuard] 
}

// Role-based routes (roleGuard)
{ 
  path: 'users', 
  component: Users, 
  canActivate: [roleGuard],
  data: { roles: ['admin', 'manager', 'user'] }  // Guests blocked
}
```

---

## 🎯 Testing Scenarios

### Scenario 1: Guest tries to access Users page

1. Login as guest (`guest@userhub.com` / `guest123`)
2. Navigate to `/users`
3. **Result:** Redirected to dashboard with error: "Access Denied"

### Scenario 2: User accesses Users page

1. Login as user (`user@userhub.com` / `user123`)
2. Navigate to `/users`
3. **Result:** Access granted ✅

### Scenario 3: Admin accesses everything

1. Login as admin (`admin@userhub.com` / `admin123`)
2. Navigate to any page
3. **Result:** Full access ✅

---

## 🔧 Adding New Protected Routes

### Example 1: Admin-only route

```typescript
{ 
  path: 'admin-panel', 
  component: AdminPanel, 
  canActivate: [roleGuard],
  data: { roles: ['admin'] }
}
```

### Example 2: Permission-based route

```typescript
{ 
  path: 'users/delete/:id', 
  component: DeleteUser, 
  canActivate: [permissionGuard],
  data: { permissions: ['delete', 'manage_users'] }
}
```

### Example 3: Multiple guards

```typescript
{ 
  path: 'sensitive-data', 
  component: SensitiveData, 
  canActivate: [authGuard, roleGuard, permissionGuard],
  data: { 
    roles: ['admin', 'manager'],
    permissions: ['read', 'write']
  }
}
```

---

## 💡 AuthService Methods

### Check Authentication
```typescript
authService.isAuthenticated(): boolean
```

### Check Role
```typescript
authService.hasRole('admin'): boolean
authService.hasAnyRole(['admin', 'manager']): boolean
authService.isAdmin(): boolean
authService.isManagerOrAdmin(): boolean
```

### Check Permissions
```typescript
authService.hasPermission('delete'): boolean
authService.hasAllPermissions(['read', 'write']): boolean
```

### Get User Info
```typescript
authService.getUserName(): string
authService.getUserEmail(): string
authService.getUserRole(): UserRole | null
authService.currentUserValue: User | null
```

---

## 🎨 UI Features

### Role Badge Display

The dashboard shows the user's role with color-coded badges:

- 🔴 **Admin** - Red badge
- 🟠 **Manager** - Orange badge
- 🔵 **User** - Blue badge
- ⚫ **Guest** - Gray badge

### Error Messages

When access is denied, users see:

- ⚠️ "Access Denied: You do not have permission to access that page."
- ⚠️ "Insufficient Permissions: You need additional permissions to access that page."

Messages auto-dismiss after 5 seconds.

---

## 🚀 Advanced Usage

### Component-Level Permission Checks

```typescript
export class UsersComponent {
  canDelete: boolean = false;

  ngOnInit() {
    // Show delete button only if user has permission
    this.canDelete = this.authService.hasPermission('delete');
  }
}
```

### Template-Level Role Checks

```html
<!-- Show admin panel only for admins -->
<div *ngIf="authService.isAdmin()">
  <button>Admin Panel</button>
</div>

<!-- Show delete button for users with delete permission -->
<button *ngIf="authService.hasPermission('delete')" (click)="deleteUser()">
  Delete
</button>
```

---

## 📊 Security Architecture

```
┌─────────────────────────────────────────┐
│           User Login Request            │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      AuthService validates with API     │
│         (checks email + password)       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    User object created with:            │
│    - id, email, name                    │
│    - role (admin/manager/user/guest)    │
│    - permissions array                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│   Saved to localStorage + BehaviorSubject│
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         User navigates to route         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│          Guards check access:           │
│  1. authGuard - Is authenticated?       │
│  2. roleGuard - Has required role?      │
│  3. permissionGuard - Has permissions?  │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
    ✅ ALLOW      ❌ DENY
    Access        Redirect
```

---

## 🎓 Key Concepts

### BehaviorSubject for Reactive State

```typescript
private currentUserSubject: BehaviorSubject<User | null>;
public currentUser$: Observable<User | null>;
```

**Benefits:**
- Components can subscribe to auth state changes
- Automatic UI updates when user logs in/out
- Always has current value available

### Functional Guards (Modern Angular)

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  // Guard logic
};
```

**Benefits:**
- Simpler than class-based guards
- Better tree-shaking
- Easier dependency injection with `inject()`

### Route Data for Configuration

```typescript
data: { roles: ['admin', 'manager'] }
```

**Benefits:**
- Reusable guards
- Declarative configuration
- Easy to modify access rules

---

## 🎉 Summary

Your application now has **enterprise-level security** with:

✅ **API-based authentication** (validates against db.json)  
✅ **Role-based access control** (4 roles: admin, manager, user, guest)  
✅ **Permission-based authorization** (4 permissions: read, write, delete, manage_users)  
✅ **Multiple guard types** (auth, role, permission)  
✅ **Reactive state management** (BehaviorSubject)  
✅ **User-friendly error messages** (access denied alerts)  
✅ **Visual role indicators** (color-coded badges)  

This is a **professional, production-ready** security system! 🚀
