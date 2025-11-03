import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage';

/**
 * User interface for authentication
 */
export interface User {
  email: string;
  name: string;
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
  // Storage key for current user
  private readonly USER_KEY = 'currentUser';

  // BehaviorSubject to track authentication state
  // Other components can subscribe to this to react to auth changes
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    // Initialize with user from localStorage (if exists)
    const storedUser = this.storageService.get<User>(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
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
   * Login user
   * @param email - User email
   * @param password - User password
   * @returns true if login successful
   */
  login(email: string, password: string): boolean {
    // In real app, this would call an API
    // For now, we accept any non-empty credentials
    if (!email || !password) {
      return false;
    }

    const user: User = {
      email: email,
      name: email.split('@')[0] || 'User',
      loginTime: new Date().toISOString()
    };

    // Save to localStorage
    this.storageService.set(this.USER_KEY, user);
    
    // Update BehaviorSubject (notifies all subscribers)
    this.currentUserSubject.next(user);

    return true;
  }

  /**
   * Logout user
   * Clears user data and redirects to login
   */
  logout(): void {
    // Remove user from localStorage
    this.storageService.remove(this.USER_KEY);
    
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
}
