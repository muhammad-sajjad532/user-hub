# 🚀 Quick Reference Card

## Test Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| 🔴 **Admin** | admin@userhub.com | admin123 | Full access |
| 🟠 **Manager** | manager@userhub.com | manager123 | High access |
| 🔵 **User** | user@userhub.com | user123 | Standard access |
| ⚫ **Guest** | guest@userhub.com | guest123 | Read-only |

---

## Access Matrix

| Page | Guest | User | Manager | Admin |
|------|-------|------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Users | ❌ | ✅ | ✅ | ✅ |

---

## Start Commands

```bash
# Terminal 1: API Server
npm run api

# Terminal 2: Angular App
ng serve
```

Open: `http://localhost:4200`

---

## File Structure

```
src/app/
├── guards/
│   ├── auth-guard.ts          # Basic authentication
│   ├── role-guard.ts          # Role-based access
│   └── permission-guard.ts    # Permission-based access
├── interceptors/
│   ├── auth-interceptor.ts    # Add auth headers
│   ├── error-interceptor.ts   # Handle HTTP errors
│   └── loading-interceptor.ts # Show loading spinner
└── services/
    └── auth.ts                # Authentication service
```

---

## Key Features

✅ **Role-Based Access Control (RBAC)**  
✅ **API-Based Authentication**  
✅ **Reactive State Management (RxJS)**  
✅ **HTTP Interceptors Chain**  
✅ **Route Guards (3 types)**  
✅ **Visual Role Indicators**  
✅ **Error Handling & User Feedback**  

---

## Demo Script

1. Login as **guest** → Try Users page → **BLOCKED** ❌
2. Logout → Login as **user** → Access Users page → **ALLOWED** ✅
3. Show role badge: GUEST (gray) → USER (blue)

**Time: 30 seconds**

---

## Code Highlights

### User with Role & Permissions
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;              // admin | manager | user | guest
  permissions: Permission[];    // read | write | delete | manage_users
  loginTime: string;
}
```

### Protected Route
```typescript
{ 
  path: 'users', 
  component: Users, 
  canActivate: [roleGuard],
  data: { roles: ['admin', 'manager', 'user'] }  // Guests blocked
}
```

### Check Permissions in Component
```typescript
canDelete = this.authService.hasPermission('delete');
isAdmin = this.authService.isAdmin();
```

---

## Documentation Files

- `SECURITY_GUIDE.md` - Complete security documentation
- `DEMO_INSTRUCTIONS.md` - Step-by-step demo guide
- `API_SETUP.md` - API setup instructions
- `QUICK_REFERENCE.md` - This file

---

## Troubleshooting

**Problem:** Can't login  
**Solution:** Make sure JSON Server is running (`npm run api`)

**Problem:** Access denied error  
**Solution:** This is expected! Try logging in with a different role

**Problem:** Role badge not showing  
**Solution:** Check browser console for errors, refresh page

---

## Tech Stack

- **Angular 19** (Standalone Components, Zoneless)
- **TypeScript** (Type-safe roles & permissions)
- **RxJS** (Reactive state management)
- **Chart.js** (Data visualization)
- **JSON Server** (Mock API)
- **Bootstrap Icons** (UI icons)

---

## Security Layers

```
Layer 1: authGuard
         ↓ Is user logged in?
         
Layer 2: roleGuard
         ↓ Does user have required role?
         
Layer 3: permissionGuard
         ↓ Does user have required permissions?
         
         ✅ ACCESS GRANTED
```

---

**Built with ❤️ for internship project**
