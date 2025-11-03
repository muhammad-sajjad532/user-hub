/**
 * EXAMPLE: Future API-based User Service
 * This shows how to use switchMap with real HTTP calls
 * When you have a backend API, replace UserService with this pattern
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

interface UserProfile {
  id: number;
  profileName: string;
  description: string;
  creationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserApiService {
  private apiUrl = 'https://your-api.com/api/profiles';
  private profilesSubject = new BehaviorSubject<UserProfile[]>([]);
  public profiles$ = this.profilesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProfiles();
  }

  /**
   * Load all profiles from API
   */
  loadProfiles(): void {
    this.http.get<UserProfile[]>(this.apiUrl).subscribe(
      profiles => this.profilesSubject.next(profiles)
    );
  }

  /**
   * Search profiles with API call
   * Uses switchMap to cancel previous search if new one comes in
   * 
   * Example usage in component:
   * searchSubject.pipe(
   *   debounceTime(150),
   *   distinctUntilChanged(),
   *   switchMap(query => this.userApiService.searchProfiles(query))
   * ).subscribe(results => {
   *   this.searchResults = results;
   * });
   */
  searchProfiles(query: string): Observable<UserProfile[]> {
    // switchMap automatically cancels previous HTTP request
    // if a new search comes in before the old one completes
    return this.http.get<UserProfile[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    }).pipe(
      map(profiles => profiles),
      catchError(error => {
        console.error('Search error:', error);
        return [];
      })
    );
  }

  /**
   * Add profile with API call
   */
  addProfile(profile: Omit<UserProfile, 'id'>): Observable<UserProfile> {
    return this.http.post<UserProfile>(this.apiUrl, profile).pipe(
      map(newProfile => {
        // Update local state
        const profiles = this.profilesSubject.value;
        this.profilesSubject.next([...profiles, newProfile]);
        return newProfile;
      })
    );
  }

  /**
   * Update profile with API call
   */
  updateProfile(id: number, updates: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/${id}`, updates).pipe(
      map(updatedProfile => {
        // Update local state
        const profiles = this.profilesSubject.value;
        const index = profiles.findIndex(p => p.id === id);
        if (index !== -1) {
          profiles[index] = updatedProfile;
          this.profilesSubject.next([...profiles]);
        }
        return updatedProfile;
      })
    );
  }

  /**
   * Delete profile with API call
   */
  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => {
        // Update local state
        const profiles = this.profilesSubject.value;
        this.profilesSubject.next(profiles.filter(p => p.id !== id));
      })
    );
  }
}

/**
 * HOW SWITCHMAP WORKS:
 * 
 * Without switchMap:
 * User types "Pro" -> API call 1 starts
 * User types "Prof" -> API call 2 starts
 * User types "Profi" -> API call 3 starts
 * All 3 calls complete, but results might arrive out of order!
 * 
 * With switchMap:
 * User types "Pro" -> API call 1 starts
 * User types "Prof" -> API call 1 CANCELLED, API call 2 starts
 * User types "Profi" -> API call 2 CANCELLED, API call 3 starts
 * Only the latest call completes, results always match current search!
 * 
 * This prevents:
 * - Race conditions (old results overwriting new ones)
 * - Wasted bandwidth (cancelled requests don't complete)
 * - Confusing UI (showing wrong results)
 */
