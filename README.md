# User Hub - Angular Internship Project

A modern user management dashboard built with Angular 20, featuring authentication, CRUD operations, and reactive search with RxJS.

## 🚀 Features

### Authentication
- ✅ Login/Logout functionality
- ✅ User session management with localStorage
- ✅ Reactive authentication state with BehaviorSubject

### User Management
- ✅ View all user profiles in a table
- ✅ Add new profiles with modal form
- ✅ Edit existing profiles
- ✅ Delete profiles with confirmation modal
- ✅ View profile details (read-only)

### Search & Filtering
- ✅ Real-time search with debouncing (150ms)
- ✅ Autocomplete suggestions (top 5 matches)
- ✅ RxJS operators: `debounceTime`, `distinctUntilChanged`, `switchMap`
- ✅ Prevents race conditions with switchMap

### Data Persistence
- ✅ LocalStorage integration
- ✅ Data survives page refresh
- ✅ Service-based architecture (easy to switch to API)

### UI/UX
- ✅ Responsive design (mobile-friendly)
- ✅ Dark blue sidebar with navigation
- ✅ Success/Delete confirmation modals with animations
- ✅ Loading states and user feedback
- ✅ Bootstrap Icons integration

## 📁 Project Structure

```
user_hub/
├── src/
│   ├── app/
│   │   ├── services/           # Business logic & data management
│   │   │   ├── auth.ts         # Authentication service
│   │   │   ├── user.ts         # User CRUD operations
│   │   │   ├── storage.ts      # LocalStorage wrapper
│   │   │   └── user-api.example.ts  # Future API integration example
│   │   │
│   │   ├── login/              # Login page
│   │   │   └── login/
│   │   │       ├── login.ts
│   │   │       ├── login.html
│   │   │       └── login.css
│   │   │
│   │   ├── signup/             # Signup page
│   │   │   └── signup/
│   │   │
│   │   ├── dashboard/          # Dashboard with stats
│   │   │   └── dashboard/
│   │   │       ├── dashboard.ts
│   │   │       ├── dashboard.html
│   │   │       └── dashboard.css
│   │   │
│   │   ├── users/              # User management page
│   │   │   └── users/
│   │   │       ├── users.ts    # Uses RxJS for search
│   │   │       ├── users.html
│   │   │       └── users.css
│   │   │
│   │   ├── app.routes.ts       # Route configuration
│   │   └── app.config.ts       # App configuration
│   │
│   ├── styles.css              # Global styles
│   └── index.html
│
├── package.json
└── README.md
```

## 🛠️ Technologies Used

- **Angular 20** - Latest Angular framework
- **TypeScript** - Type-safe JavaScript
- **RxJS** - Reactive programming with Observables
- **Bootstrap Icons** - Icon library
- **LocalStorage** - Client-side data persistence

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd user_hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm start
```

4. **Open browser**
Navigate to `http://localhost:4200`

## 🎯 Key Concepts Implemented

### 1. Service-Based Architecture

**StorageService** - Centralized localStorage management
```typescript
// Type-safe storage operations
storageService.set('key', data);
const data = storageService.get<Type>('key');
```

**AuthService** - Authentication with reactive state
```typescript
// BehaviorSubject for reactive auth state
currentUser$: Observable<User | null>
isAuthenticated(): boolean
login(email, password): boolean
logout(): void
```

**UserService** - CRUD operations with reactive updates
```typescript
// BehaviorSubject for reactive profile updates
profiles$: Observable<UserProfile[]>
addProfile(profile): UserProfile
updateProfile(id, updates): UserProfile
deleteProfile(id): boolean
searchProfiles(query): UserProfile[]
```

### 2. RxJS Reactive Search

**Problem**: User types fast, multiple searches trigger, results arrive out of order

**Solution**: RxJS operators pipeline
```typescript
searchSubject.pipe(
  debounceTime(150),        // Wait 150ms after typing stops
  distinctUntilChanged(),   // Only search if query changed
  switchMap(query => {      // Cancel previous search, start new
    return of(query).pipe(
      map(q => ({
        results: this.userService.searchProfiles(q),
        suggestions: this.getSuggestions(q)
      }))
    );
  })
).subscribe(({ results, suggestions }) => {
  // Update UI with latest results only
});
```

**Benefits**:
- ✅ No race conditions
- ✅ Cancels unnecessary searches
- ✅ Always shows correct results
- ✅ Better performance

### 3. Data Persistence Pattern

**Current**: LocalStorage (for development)
```typescript
// Easy to understand, no backend needed
localStorage.setItem('profiles', JSON.stringify(profiles));
```

**Future**: HTTP API (production-ready)
```typescript
// Just swap the service implementation
this.http.get<UserProfile[]>('/api/profiles')
```

The service layer makes switching from localStorage to API seamless!

## 🎨 UI Components

### Modals
1. **View Profile** - Read-only profile details
2. **Edit Profile** - Editable form with validation
3. **Add Profile** - Create new profile
4. **Delete Confirmation** - Red warning with cancel/confirm
5. **Success Message** - Green checkmark with auto-close

### Search Features
- Real-time filtering
- Autocomplete dropdown
- Clear button (X icon)
- Keyboard navigation ready

### Dashboard
- Total Users card (green)
- Monthly Users card (yellow)
- Monthly Turnover chart (bar chart)
- Responsive layout

## 🔐 Authentication Flow

```
1. User enters email/password
   ↓
2. AuthService.login() validates
   ↓
3. User data saved to localStorage
   ↓
4. BehaviorSubject emits new user state
   ↓
5. Navigate to /dashboard
   ↓
6. Components subscribe to currentUser$
   ↓
7. UI updates reactively
```

## 📊 Data Flow

```
Component → Service → LocalStorage
    ↑          ↓
    ←─ BehaviorSubject ─←
```

**Reactive Updates**:
- Add profile → Service updates → BehaviorSubject emits → All subscribers update
- Edit profile → Service updates → BehaviorSubject emits → Table refreshes
- Delete profile → Service updates → BehaviorSubject emits → UI updates

## 🚧 Upcoming Features (Phase 2)

- [ ] Auth Guard (route protection)
- [ ] HTTP Interceptor (token management)
- [ ] Error Interceptor (global error handling)
- [ ] Loading spinner
- [ ] Form validation improvements
- [ ] Pagination improvements
- [ ] Export to CSV/PDF
- [ ] Backend API integration

## 📝 Code Quality

### Best Practices Implemented
✅ TypeScript interfaces for type safety
✅ Service layer for business logic
✅ Component separation of concerns
✅ RxJS for reactive programming
✅ Memory leak prevention (unsubscribe in ngOnDestroy)
✅ Clean code with comments
✅ Consistent naming conventions

### Performance Optimizations
✅ Debounced search (reduces operations)
✅ switchMap (cancels unnecessary requests)
✅ OnPush change detection ready
✅ Lazy loading ready

## 🤝 Contributing

This is an internship project. Feedback and suggestions are welcome!

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

Internship Project - User Management Dashboard

---

## 🎓 Learning Outcomes

Through this project, I learned:
- Angular 20 standalone components
- RxJS reactive programming
- Service-based architecture
- State management with BehaviorSubject
- TypeScript best practices
- Responsive UI design
- Data persistence strategies
- Search optimization techniques

---

**Built with ❤️ using Angular**
