# Role-Based Permissions Guide

## User Roles

The system supports 4 user roles with different permission levels:

### 1. Admin (Highest Access)
- ✅ View Students
- ✅ Add Students
- ✅ Edit Students
- ✅ Delete Students
- ✅ Access all modules
- ✅ Manage settings

### 2. Manager
- ✅ View Students
- ✅ Add Students
- ✅ Edit Students
- ❌ Delete Students (Admin only)
- ✅ Access most modules
- ✅ Manage settings

### 3. User (Standard Access)
- ✅ View Students
- ❌ Add Students (Admin/Manager only)
- ❌ Edit Students (Admin/Manager only)
- ❌ Delete Students (Admin only)
- ✅ Access basic modules
- ✅ Manage own settings

### 4. Guest (Limited Access)
- ❌ Cannot access Students module
- ❌ Cannot access most features
- ✅ Can view dashboard only
- ✅ Can manage own settings

## Students Module Permissions

| Action | Admin | Manager | User | Guest |
|--------|-------|---------|------|-------|
| View Students | ✅ | ✅ | ✅ | ❌ |
| View Details | ✅ | ✅ | ✅ | ❌ |
| Add Student | ✅ | ✅ | ❌ | ❌ |
| Edit Student | ✅ | ✅ | ❌ | ❌ |
| Delete Student | ✅ | ❌ | ❌ | ❌ |

## Action Buttons Visibility

Based on user role, action buttons are shown/hidden:

**Admin sees:**
- 👁️ View (Green)
- ✏️ Edit (Blue)
- 🗑️ Delete (Red)

**Manager sees:**
- 👁️ View (Green)
- ✏️ Edit (Blue)

**User sees:**
- 👁️ View (Green)

**Guest:**
- Cannot access Students module

## How It Works

### Route Protection
```typescript
{
  path: 'students',
  component: Students,
  canActivate: [roleGuard],
  data: { roles: ['admin', 'manager', 'user'] }
}
```

### Component-Level Checks
```typescript
canAdd(): boolean {
  return ['admin', 'manager'].includes(this.userRole);
}

canEdit(): boolean {
  return ['admin', 'manager'].includes(this.userRole);
}

canDelete(): boolean {
  return this.userRole === 'admin';
}

canView(): boolean {
  return true; // All authenticated users
}
```

### Template Usage
```html
<button *ngIf="canAdd()" (click)="openAddModal()">
  Add New Student
</button>

<button *ngIf="canView()" (click)="viewStudent(student)">
  <i class="bi bi-eye-fill"></i>
</button>

<button *ngIf="canEdit()" (click)="openEditModal(student)">
  <i class="bi bi-pencil-fill"></i>
</button>

<button *ngIf="canDelete()" (click)="deleteStudent(student.id)">
  <i class="bi bi-trash-fill"></i>
</button>
```

## Testing Permissions

### Test as Admin
```
Email: admin@school.com
Password: admin123
Role: admin
```
**Expected:** See all 3 action buttons (View, Edit, Delete)

### Test as Manager
Create a user with role "manager"
**Expected:** See 2 action buttons (View, Edit)

### Test as User
Create a user with role "user"
**Expected:** See 1 action button (View only)

### Test as Guest
Create a user with role "guest"
**Expected:** Cannot access Students module, redirected to dashboard

## Error Messages

When users try to perform unauthorized actions:

- **Add without permission:** "You do not have permission to add students"
- **Edit without permission:** "You do not have permission to edit students"
- **Delete without permission:** "You do not have permission to delete students"
- **Access denied:** Redirected to dashboard with error message

## Notifications

Actions trigger notifications:
- ✅ **Add Student:** "New Student Added - [Name] has been admitted to [Class]"
- ✏️ **Edit Student:** "Student Updated - [Name]'s information has been updated"
- 🗑️ **Delete Student:** "Student Deleted - [Name] has been removed from records"

## Future Enhancements

- [ ] Add permission for viewing specific classes only
- [ ] Add permission for fee collection
- [ ] Add permission for attendance marking
- [ ] Add audit log for all actions
- [ ] Add bulk operations with permissions
- [ ] Add export data permission

---

**Note:** Always test permissions thoroughly before deploying to production!
