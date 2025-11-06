import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { UserService, UserProfile } from '../../../services/user';
import { AuthService } from '../../../services/auth';

/**
 * Users Component
 * Manages user profiles with CRUD operations
 * Uses RxJS for reactive search with debouncing
 * Data persists in localStorage via UserService
 */
@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit, OnDestroy {
  // User data
  userName: string = '';
  notificationCount: number = 5;

  // Sidebar state
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'users';

  // Search with RxJS - debounces input to avoid excessive filtering
  searchQuery: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  // Search suggestions (autocomplete)
  searchSuggestions: UserProfile[] = [];
  showSuggestions: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Profiles data
  allUsers: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];
  private profilesSubscription?: Subscription;

  // Modal state
  showModal: boolean = false;
  modalMode: 'view' | 'edit' | 'add' = 'view';
  selectedUser: UserProfile | null = null;

  // Delete confirmation state
  showDeleteModal: boolean = false;
  userToDelete: UserProfile | null = null;

  // Success message state
  showSuccessModal: boolean = false;
  successMessage: string = '';

  // Form data
  formData = {
    id: 0,
    profileName: '',
    description: '',
    creationDate: ''
  };

  // Expose Math to template
  Math = Math;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    //private cdr: ChangeDetectorRef
  ) {}

  /**
   * Check if current user can delete profiles
   * Only users with 'delete' permission can delete
   */
  canDelete(): boolean {
    return this.authService.hasPermission('delete');
  }

  /**
   * Check if current user can create/edit profiles
   * Only users with 'write' permission can create/edit
   */
  canWrite(): boolean {
    return this.authService.hasPermission('write');
  }

  /**
   * Initialize component
   * - Load user data from auth service
   * - Subscribe to profiles from user service
   * - Setup search with debouncing
   */
  ngOnInit(): void {
    // Get current user name
    this.userName = this.authService.getUserName();

    // Subscribe to profiles (reactive updates)
    this.profilesSubscription = this.userService.profiles$.subscribe(profiles => {
      this.allUsers = profiles;
      this.applySearch(); // Re-apply search when data changes
    });

    // Setup search with debouncing and switchMap
    // switchMap is KEY: it cancels previous search if new one comes in
    // This prevents race conditions and improves performance
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(150), // Wait 150ms after user stops typing
      distinctUntilChanged(), // Only proceed if value actually changed
      
      // switchMap: The magic operator!
      // - Cancels previous "inner observable" when new value comes
      // - Perfect for search: if user types "abc" then "abcd", 
      //   the "abc" search is cancelled automatically
      switchMap(query => {
        // Return an observable (even if just wrapping sync data)
        // In real API, this would be: this.http.get(...)
        return of(query).pipe(
          map(q => ({
            query: q,
            results: this.userService.searchProfiles(q),
            suggestions: this.getSuggestions(q)
          }))
        );
      })
    ).subscribe(({ query, results, suggestions }) => {
      this.searchQuery = query;
      this.filteredUsers = results;
      this.searchSuggestions = suggestions;
      this.showSuggestions = suggestions.length > 0 && query.trim() !== '';
      this.currentPage = 1; // Reset to first page on search
    });
  }

  /**
   * Cleanup subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
    this.profilesSubscription?.unsubscribe();
  }

  /**
   * Handle search input change
   * Emits to searchSubject which triggers debounced search
   */
  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  /**
   * Apply search filter to profiles
   */
  private applySearch(): void {
    this.filteredUsers = this.userService.searchProfiles(this.searchQuery);
  }

  /**
   * Get search suggestions (top 5 matches)
   * This is called within switchMap pipeline
   */
  private getSuggestions(query: string): UserProfile[] {
    if (!query.trim()) {
      return [];
    }
    const matches = this.userService.searchProfiles(query);
    return matches.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Select a suggestion from autocomplete
   */
  selectSuggestion(profile: UserProfile): void {
    this.searchQuery = profile.profileName;
    this.searchSubject.next(this.searchQuery);
    this.showSuggestions = false;
  }

  /**
   * Clear search and suggestions
   */
  clearSearch(): void {
    this.searchQuery = '';
    this.searchSubject.next('');
    this.showSuggestions = false;
  }

  /**
   * Hide suggestions when clicking outside
   */
  hideSuggestions(): void {
    // Small delay to allow click on suggestion to register
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  /**
   * Get paginated users for current page
   */
  get paginatedUsers(): UserProfile[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  /**
   * Get total pages based on filtered results
   */
  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  /**
   * View profile (read-only modal)
   */
  onView(user: UserProfile): void {
    this.selectedUser = user;
    this.formData = { ...user };
    this.modalMode = 'view';
    this.showModal = true;
  }

  /**
   * Edit profile (editable modal)
   */
  onEdit(user: UserProfile): void {
    this.selectedUser = user;
    this.formData = { ...user };
    this.modalMode = 'edit';
    this.showModal = true;
  }

  /**
   * Close view/edit modal
   */
  closeModal(): void {
    this.showModal = false;
    this.selectedUser = null;
    this.formData = {
      id: 0,
      profileName: '',
      description: '',
      creationDate: ''
    };
  }

  /**
   * Save profile (add or update)
   */
  saveUser(): void {
    if (!this.formData.profileName.trim() || !this.formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (this.modalMode === 'add') {
      // Add new profile via API
      this.userService.addProfile({
        profileName: this.formData.profileName,
        description: this.formData.description,
        creationDate: this.formData.creationDate
      }).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccessMessage('Profile added successfully!');
        },
        error: (error) => {
          console.error('Error adding profile:', error);
          alert('Failed to add profile. Please try again.');
        }
      });
    } else {
      // Update existing profile via API
      this.userService.updateProfile(this.formData.id, {
        profileName: this.formData.profileName,
        description: this.formData.description
      }).subscribe({
        next: () => {
          this.closeModal();
          this.showSuccessMessage('Profile updated successfully!');
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile. Please try again.');
        }
      });
    }
  }

  /**
   * Show delete confirmation modal
   */
  onDelete(user: UserProfile): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  /**
   * Confirm and execute delete
   */
  confirmDelete(): void {
    if (this.userToDelete) {
      const profileName = this.userToDelete.profileName;
      
      this.userService.deleteProfile(this.userToDelete.id).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.showSuccessMessage(`${profileName} deleted successfully!`);
        },
        error: (error) => {
          console.error('Error deleting profile:', error);
          alert('Failed to delete profile. Please try again.');
          this.closeDeleteModal();
        }
      });
    }
  }

  /**
   * Close delete confirmation modal
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  /**
   * Open add new profile modal
   */
  onAddNewProfile(): void {
    this.selectedUser = null;
    this.formData = {
      id: 0,
      profileName: '',
      description: '',
      creationDate: this.userService.getCurrentDate()
    };
    this.modalMode = 'add';
    this.showModal = true;
  }

  /**
   * Show success message modal
   * Auto-closes after 2 seconds
   */
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccessModal = true;
    
    // Manually trigger change detection for zoneless mode
    //this.cdr.detectChanges();

    // Auto-close after 3 seconds
    setTimeout(() => {
      this.closeSuccessModal();
      //this.cdr.detectChanges();
    }, 3000);
  }

  /**
   * Close success message modal
   */
  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.successMessage = '';
    //this.cdr.detectChanges(); // Trigger change detection
  }

  /**
   * Navigate to previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Navigate to next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  /**
   * Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  /**
   * Set active menu and navigate
   */
  setActiveMenu(menu: string): void {
    this.activeMenu = menu;

    if (menu === 'dashboard') {
      this.router.navigate(['/dashboard']);
    } else if (menu === 'users') {
      this.router.navigate(['/users']);
    }
  }

  /**
   * Logout user via auth service
   */
  onLogout(): void {
    this.authService.logout();
  }
}
