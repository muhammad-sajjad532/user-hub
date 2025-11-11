import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { ThemeService } from '../../../services/theme';
import { NotificationService, Notification } from '../../../services/notification';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  // User data
  userName: string = '';
  userEmail: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  
  // Notifications
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;

  // Sidebar state
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'setting';

  // Active tab
  activeTab: string = 'profile';

  // Profile form
  profileForm = {
    name: '',
    email: '',
    phone: '',
    bio: ''
  };

  // Password form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Preferences
  preferences = {
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en'
  };

  // Success/Error messages
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private themeService: ThemeService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Get user info
    this.userName = this.authService.getUserName();
    this.userEmail = this.authService.getUserEmail();
    this.userRole = this.authService.getUserRole() || 'user';

    // Initialize profile form
    this.profileForm.name = this.userName;
    this.profileForm.email = this.userEmail;
    
    // Initialize dark mode from theme service
    this.preferences.darkMode = this.themeService.isDarkMode;
    
    // Load notifications
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notificationService.getUnreadCount();
    });
  }

  // Toggle sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Set active menu
  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    if (menu === 'dashboard') {
      this.router.navigate(['/dashboard']);
    } else if (menu === 'students') {
      this.router.navigate(['/students']);
    } else if (menu === 'teachers') {
      this.router.navigate(['/teachers']);
    } else if (menu === 'classes') {
      this.router.navigate(['/classes']);
    } else if (menu === 'attendance') {
      this.router.navigate(['/attendance']);
    } else if (menu === 'fees') {
      this.router.navigate(['/fees']);
    } else if (menu === 'setting') {
      this.router.navigate(['/settings']);
    }
  }

  // Set active tab
  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  // Save profile
  saveProfile(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    // Update user in db.json via API
    const updatedUser = {
      ...currentUser,
      name: this.profileForm.name,
      email: this.profileForm.email
    };

    // Update in db.json
    this.http.put(`http://localhost:3000/users/${currentUser.id}`, updatedUser).subscribe({
      next: (response) => {
        // Update localStorage
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.successMessage = '✅ Profile updated successfully in database!';
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.errorMessage = '❌ Failed to update profile!';
        setTimeout(() => this.clearMessages(), 3000);
      }
    });
  }

  // Change password
  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = '❌ Passwords do not match!';
      setTimeout(() => this.clearMessages(), 3000);
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.errorMessage = '❌ Password must be at least 6 characters!';
      setTimeout(() => this.clearMessages(), 3000);
      return;
    }

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    // Update password in db.json
    const updatedUser = {
      ...currentUser,
      password: this.passwordForm.newPassword
    };

    this.http.put(`http://localhost:3000/users/${currentUser.id}`, updatedUser).subscribe({
      next: (response) => {
        this.successMessage = '✅ Password changed successfully in database!';
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.clearMessages(), 3000);
      },
      error: (error) => {
        console.error('Password change error:', error);
        this.errorMessage = '❌ Failed to change password!';
        setTimeout(() => this.clearMessages(), 3000);
      }
    });
  }

  // Save preferences
  savePreferences(): void {
    this.successMessage = '✅ Preferences saved successfully!';
    setTimeout(() => this.clearMessages(), 3000);
  }

  // Toggle dark mode
  toggleDarkMode(): void {
    this.themeService.setDarkMode(this.preferences.darkMode);
  }

  // Clear messages
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  // Logout
  onLogout(): void {
    this.authService.logout();
  }

  // Get role badge class
  getRoleBadgeClass(): string {
    switch (this.userRole) {
      case 'admin': return 'role-badge-admin';
      case 'manager': return 'role-badge-manager';
      case 'user': return 'role-badge-user';
      case 'guest': return 'role-badge-guest';
      default: return 'role-badge-user';
    }
  }

  // Toggle notification dropdown
  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  // Mark notification as read
  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.showNotificationDropdown = false;
  }

  // Delete notification
  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  // Get time ago string
  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  }
}
