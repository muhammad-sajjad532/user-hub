import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/**
 * User Profile interface
 */
export interface UserProfile {
  id: number;
  profileName: string;
  description: string;
  creationDate: string;
}

/**
 * User Service with JSON Server API
 * Now uses real HTTP requests instead of localStorage
 * Data persists permanently in db.json file
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // API endpoint
  private readonly API_URL = 'http://localhost:3000/profiles';

  // BehaviorSubject to track profiles state
  private profilesSubject: BehaviorSubject<UserProfile[]>;
  public profiles$: Observable<UserProfile[]>;

  constructor(private http: HttpClient) {
    // Initialize with empty array
    this.profilesSubject = new BehaviorSubject<UserProfile[]>([]);
    this.profiles$ = this.profilesSubject.asObservable();

    // Load profiles from API on service initialization
    this.loadProfiles();
  }

  /**
   * Load all profiles from API
   */
  loadProfiles(): void {
    this.http.get<UserProfile[]>(this.API_URL).pipe(
      tap(profiles => {
        console.log('Profiles loaded from API:', profiles);
        this.profilesSubject.next(profiles);
      }),
      catchError(error => {
        console.error('Error loading profiles:', error);
        return [];
      })
    ).subscribe();
  }

  /**
   * Get all profiles (synchronous from cache)
   */
  getAllProfiles(): UserProfile[] {
    return this.profilesSubject.value;
  }

  /**
   * Get profile by ID
   */
  getProfileById(id: number): UserProfile | undefined {
    return this.profilesSubject.value.find(p => p.id === id);
  }

  /**
   * Add new profile via API
   * @param profile - Profile data (without ID, server generates it)
   * @returns Observable of created profile
   */
  addProfile(profile: Omit<UserProfile, 'id'>): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.API_URL, profile).pipe(
      tap(newProfile => {
        console.log('Profile added:', newProfile);
        // Update local cache
        const profiles = this.getAllProfiles();
        this.profilesSubject.next([...profiles, newProfile]);
      }),
      catchError(error => {
        console.error('Error adding profile:', error);
        throw error;
      })
    );
  }

  /**
   * Update existing profile via API
   * @param id - Profile ID
   * @param updates - Fields to update
   * @returns Observable of updated profile
   */
  updateProfile(id: number, updates: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.API_URL}/${id}`, updates).pipe(
      tap(updatedProfile => {
        console.log('Profile updated:', updatedProfile);
        // Update local cache
        const profiles = this.getAllProfiles();
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
          profiles[index] = updatedProfile;
          this.profilesSubject.next([...profiles]);
        }
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        throw error;
      })
    );
  }

  /**
   * Delete profile via API
   * @param id - Profile ID
   * @returns Observable of void
   */
  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log('Profile deleted:', id);
        // Update local cache
        const profiles = this.getAllProfiles();
        this.profilesSubject.next(profiles.filter(p => p.id !== id));
      }),
      catchError(error => {
        console.error('Error deleting profile:', error);
        throw error;
      })
    );
  }

  /**
   * Search profiles by name (client-side filtering)
   * @param query - Search query
   * @returns Filtered profiles
   */
  searchProfiles(query: string): UserProfile[] {
    if (!query.trim()) {
      return this.getAllProfiles();
    }

    const lowerQuery = query.toLowerCase();
    return this.getAllProfiles().filter(profile =>
      profile.profileName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get current date in DD-MM-YYYY format
   */
  getCurrentDate(): string {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
