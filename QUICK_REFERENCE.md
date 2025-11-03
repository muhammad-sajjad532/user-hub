# 🚀 Quick Reference Guide

## Common Commands

### Development
```bash
npm start              # Start dev server (localhost:4200)
npm run build          # Build for production
npm test               # Run tests
```

### Git
```bash
git status             # Check changes
git add .              # Stage all changes
git commit -m "msg"    # Commit with message
git push               # Push to GitHub
```

---

## Project Structure Quick Look

```
services/
  ├── auth.ts          → Login/Logout
  ├── user.ts          → CRUD operations
  └── storage.ts       → LocalStorage wrapper

components/
  ├── login/           → Login page
  ├── dashboard/       → Stats & charts
  └── users/           → User management (main)
```

---

## Key Code Snippets

### Using AuthService
```typescript
// In component constructor
constructor(private authService: AuthService) {}

// Login
this.authService.login(email, password);

// Logout
this.authService.logout();

// Check if authenticated
if (this.authService.isAuthenticated()) { }

// Get user name
const name = this.authService.getUserName();

// Subscribe to auth state
this.authService.currentUser$.subscribe(user => {
  console.log('User changed:', user);
});
```

### Using UserService
```typescript
// In component constructor
constructor(private userService: UserService) {}

// Subscribe to profiles
this.userService.profiles$.subscribe(profiles => {
  this.allUsers = profiles;
});

// Add profile
this.userService.addProfile({
  profileName: 'New Profile',
  description: 'Description',
  creationDate: '01-01-2025'
});

// Update profile
this.userService.updateProfile(id, {
  profileName: 'Updated Name'
});

// Delete profile
this.userService.deleteProfile(id);

// Search profiles
const results = this.userService.searchProfiles('query');
```

### RxJS Search Pattern
```typescript
// Setup in ngOnInit
this.searchSubscription = this.searchSubject.pipe(
  debounceTime(150),
  distinctUntilChanged(),
  switchMap(query => {
    return of(query).pipe(
      map(q => ({
        results: this.userService.searchProfiles(q)
      }))
    );
  })
).subscribe(({ results }) => {
  this.filteredUsers = results;
});

// Trigger search
onSearchChange(query: string): void {
  this.searchSubject.next(query);
}

// Cleanup
ngOnDestroy(): void {
  this.searchSubscription?.unsubscribe();
}
```

---

## Common Issues & Solutions

### Issue: Data disappears on refresh
**Solution**: Check if service is saving to localStorage
```typescript
// In service
this.storageService.set('key', data);
```

### Issue: Search not working
**Solution**: Check if searchSubject is emitting
```typescript
// In component
onSearchChange(query: string): void {
  this.searchSubject.next(query);  // Make sure this is called
}
```

### Issue: Memory leak warning
**Solution**: Unsubscribe in ngOnDestroy
```typescript
ngOnDestroy(): void {
  this.subscription?.unsubscribe();
}
```

### Issue: Modal not closing
**Solution**: Check if method is bound correctly
```typescript
// In HTML
(click)="closeModal()"  // Not (click)="closeModal"
```

---

## Useful VS Code Extensions

- **Angular Language Service** - IntelliSense for Angular
- **Angular Snippets** - Code snippets
- **Prettier** - Code formatter
- **ESLint** - Code linting
- **GitLens** - Git integration

---

## Keyboard Shortcuts (VS Code)

- `Ctrl + P` - Quick file open
- `Ctrl + Shift + P` - Command palette
- `Ctrl + B` - Toggle sidebar
- `Ctrl + `` - Toggle terminal
- `Alt + Up/Down` - Move line up/down
- `Ctrl + /` - Toggle comment

---

## Testing Checklist

Before committing:
- [ ] Code compiles without errors
- [ ] All features work as expected
- [ ] No console errors
- [ ] Data persists on refresh
- [ ] Responsive on mobile
- [ ] Comments are clear

---

## Deployment Checklist

Before deploying:
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set
- [ ] API endpoints configured
- [ ] Error handling in place
- [ ] Loading states added
- [ ] SEO meta tags added

---

## Resources

- [Angular Docs](https://angular.dev)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)

---

**Keep this handy while coding!** 📌
