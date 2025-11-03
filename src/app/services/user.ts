import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage';

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
 * User Service
 * Manages user profiles with localStorage persistence
 * Uses BehaviorSubject for reactive data updates
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Storage key for user profiles
  private readonly PROFILES_KEY = 'userProfiles';

  // BehaviorSubject to track profiles state
  // Components subscribe to this for real-time updates
  private profilesSubject: BehaviorSubject<UserProfile[]>;
  public profiles$: Observable<UserProfile[]>;

  // Sample initial data (only used if no data in localStorage)
  private readonly INITIAL_PROFILES: UserProfile[] = [
    { id: 1, profileName: 'Profile-1', description: 'xyz', creationDate: '20-08-2025' },
    { id: 2, profileName: 'Profile-2', description: 'xyz', creationDate: '21-08-2025' },
    { id: 3, profileName: 'Profile-3', description: 'xyz', creationDate: '22-08-2025' },
    { id: 4, profileName: 'Profile-4', description: 'xyz', creationDate: '23-08-2025' },
    { id: 5, profileName: 'Profile-5', description: 'xyz', creationDate: '24-08-2025' },
    { id: 6, profileName: 'Profile-6', description: 'abc', creationDate: '25-08-2025' },
    { id: 7, profileName: 'Profile-7', description: 'def', creationDate: '26-08-2025' },
    { id: 8, profileName: 'Profile-8', description: 'ghi', creationDate: '27-08-2025' },
    { id: 9, profileName: 'Profile-9', description: 'jkl', creationDate: '28-08-2025' },
    { id: 10, profileName: 'Profile-10', description: 'mno', creationDate: '29-08-2025' },
  ];

  constructor(private storageService: StorageService) {
    // Load profiles from localStorage or use initial data
    const storedProfiles = this.loadProfiles();
    this.profilesSubject = new BehaviorSubject<UserProfile[]>(storedProfiles);
    this.profiles$ = this.profilesSubject.asObservable();
  }

  /**
   * Load profiles from localStorage
   * Returns initial data if nothing stored
   */
  private loadProfiles(): UserProfile[] {
    const stored = this.storageService.get<UserProfile[]>(this.PROFILES_KEY);
    
    // If no data in localStorage, save and return initial data
    if (!stored || stored.length === 0) {
      this.storageService.set(this.PROFILES_KEY, this.INITIAL_PROFILES);
      return [...this.INITIAL_PROFILES];
    }
    
    return stored;
  }

  /**
   * Save profiles to localStorage
   */
  private saveProfiles(profiles: UserProfile[]): void {
    this.storageService.set(this.PROFILES_KEY, profiles);
    this.profilesSubject.next(profiles);
  }

  /**
   * Get all profiles (synchronous)
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
   * Add new profile
   * @param profile - Profile data (without ID)
   * @returns Created profile with ID
   */
  addProfile(profile: Omit<UserProfile, 'id'>): UserProfile {
    const profiles = this.getAllProfiles();
    
    // Generate new ID
    const newId = profiles.length > 0 
      ? Math.max(...profiles.map(p => p.id)) + 1 
      : 1;

    const newProfile: UserProfile = {
      id: newId,
      ...profile
    };

    // Add to array and save
    const updatedProfiles = [...profiles, newProfile];
    this.saveProfiles(updatedProfiles);

    return newProfile;
  }

  /**
   * Update existing profile
   * @param id - Profile ID
   * @param updates - Fields to update
   * @returns Updated profile or undefined if not found
   */
  updateProfile(id: number, updates: Partial<UserProfile>): UserProfile | undefined {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === id);

    if (index === -1) {
      return undefined;
    }

    // Update profile
    const updatedProfile = { ...profiles[index], ...updates, id }; // Keep original ID
    profiles[index] = updatedProfile;

    // Save changes
    this.saveProfiles(profiles);

    return updatedProfile;
  }

  /**
   * Delete profile
   * @param id - Profile ID
   * @returns true if deleted, false if not found
   */
  deleteProfile(id: number): boolean {
    const profiles = this.getAllProfiles();
    const filteredProfiles = profiles.filter(p => p.id !== id);

    // Check if anything was deleted
    if (filteredProfiles.length === profiles.length) {
      return false;
    }

    // Save changes
    this.saveProfiles(filteredProfiles);

    return true;
  }

  /**
   * Search profiles by name
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
