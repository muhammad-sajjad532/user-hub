import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, catchError, of } from 'rxjs';

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

/**
 * User permissions
 */
export type Permission = 'read' | 'write' | 'delete' | 'manage_users';

/**
 * User interface for authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  loginTime: string;
}

/**
 * Auth Service
 * Manages user authentication state and operations
 * Uses BehaviorSubject for reactive authentication state
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API endpoint
  private readonly API_URL = 'http://localhost:3000/users';
  
  // Storage key for current user
  private readonly USER_KEY = 'currentUser';

  // BehaviorSubject to track authentication state
  // Other components can subscribe to this to react to auth changes
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Initialize with user from localStorage (if exists)
    const storedUser = localStorage.getItem(this.USER_KEY);
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value (synchronous)
   */
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  /**
   * Login user with API validation
   * @param email - User email
   * @param password - User password
   * @returns Observable<User | null>
   */
  login(email: string, password: string): Observable<User | null> {
    if (!email || !password) {
      return of(null);
    }

    // Query API for user with matching email and password
    return this.http.get<any[]>(`${this.API_URL}?email=${email}&password=${password}`).pipe(
      map(users => {
        if (users && users.length > 0) {
          const userData = users[0];
          
          // Create user object with role and permissions
          const user: User = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            permissions: userData.permissions,
            loginTime: new Date().toISOString()
          };

          // Save to localStorage
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          
          // Update BehaviorSubject (notifies all subscribers)
          this.currentUserSubject.next(user);

          console.log('✅ Login successful:', user.name, `(${user.role})`);
          return user;
        }
        
        console.log('❌ Login failed: Invalid credentials');
        return null;
      }),
      catchError(error => {
        console.error('❌ Login error:', error);
        return of(null);
      })
    );
  }

  /**
   * Logout user
   * Clears user data and redirects to login
   */
  logout(): void {
    // Remove user from localStorage
    localStorage.removeItem(this.USER_KEY);
    
    // Update BehaviorSubject
    this.currentUserSubject.next(null);
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Get current user name
   */
  getUserName(): string {
    return this.currentUserValue?.name || 'User';
  }

  /**
   * Get current user email
   */
  getUserEmail(): string {
    return this.currentUserValue?.email || '';
  }

  /**
   * Get current user role
   */
  getUserRole(): UserRole | null {
    return this.currentUserValue?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserValue?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserValue?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    return this.currentUserValue?.permissions.includes(permission) || false;
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    const userPermissions = this.currentUserValue?.permissions || [];
    return permissions.every(p => userPermissions.includes(p));
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin(): boolean {
    return this.hasAnyRole(['admin', 'manager']);
  }
}
