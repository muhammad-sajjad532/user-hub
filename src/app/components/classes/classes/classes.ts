import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';
import { ClassService, Class } from '../../../services/class.service';

@Component({
  selector: 'app-classes',
  imports: [CommonModule, FormsModule],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class Classes implements OnInit {
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'classes';

  classes: Class[] = [];
  filteredClasses: Class[] = [];
  searchQuery: string = '';
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  showEditModal: boolean = false;
  showSuccessModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedClass: Class | null = null;
  classToDelete: Class | null = null;
  successMessage: string = '';
  successIcon: string = '';
  
  newClass: Class = {
    id: 0,
    name: '',
    grade: '',
    section: '',
    classTeacher: '',
    subject: '',
    room: '',
    totalStudents: 0,
    schedule: 'Mon-Fri, 8:00 AM - 2:00 PM',
    status: 'active'
  };

  editClass: Class = {
    id: 0,
    name: '',
    grade: '',
    section: '',
    classTeacher: '',
    subject: '',
    room: '',
    totalStudents: 0,
    schedule: '',
    status: 'active'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole() || 'user';
    
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notificationService.getUnreadCount();
    });

    this.loadClasses();
  }

  loadClasses(): void {
    this.classService.getAll().subscribe({
      next: (data) => {
        this.classes = data;
        this.filteredClasses = [...this.classes];
      },
      error: (error) => {
        console.error('Error loading classes:', error);
        alert('Failed to load classes. Please make sure JSON Server is running on port 3000.');
      }
    });
  }

  searchClasses(): void {
    if (!this.searchQuery.trim()) {
      this.filteredClasses = [...this.classes];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredClasses = this.classes.filter(cls =>
      cls.name.toLowerCase().includes(query) ||
      cls.classTeacher.toLowerCase().includes(query) ||
      cls.room.toLowerCase().includes(query)
    );
  }

  openAddModal(): void {
    if (!this.canAdd()) {
      alert('You do not have permission to add classes');
      return;
    }
    this.showAddModal = true;
    this.newClass = {
      id: 0,
      name: '',
      grade: '',
      section: '',
      classTeacher: '',
      subject: '',
      room: '',
      totalStudents: 0,
      schedule: 'Mon-Fri, 8:00 AM - 2:00 PM',
      status: 'active'
    };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addClass(): void {
    if (!this.newClass.name || !this.newClass.grade || !this.newClass.classTeacher) {
      alert('Please fill all required fields');
      return;
    }

    const className = this.newClass.name;
    const { id, ...classData } = this.newClass;

    this.classService.create(classData).subscribe({
      next: (savedClass) => {
        this.classes.push(savedClass);
        this.filteredClasses = [...this.classes];
        this.closeAddModal();
        
        this.notificationService.addNotification({
          title: 'New Class Added',
          message: `${className} has been created`,
          type: 'success',
          read: false,
          icon: 'bi-plus-circle-fill'
        });

        this.showSuccessMessage('Class Added Successfully!', `${className} has been created`, 'bi-check-circle-fill');
      },
      error: (error) => {
        console.error('Error adding class:', error);
        alert('Failed to add class. Please try again.');
      }
    });
  }

  viewClass(cls: Class): void {
    this.selectedClass = cls;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedClass = null;
  }

  openEditModal(cls: Class): void {
    if (!this.canEdit()) {
      alert('You do not have permission to edit classes');
      return;
    }
    this.editClass = { ...cls };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  updateClass(): void {
    if (!this.editClass.name || !this.editClass.grade || !this.editClass.classTeacher) {
      alert('Please fill all required fields');
      return;
    }

    const className = this.editClass.name;

    this.classService.update(this.editClass.id, this.editClass).subscribe({
      next: (updatedClass) => {
        const index = this.classes.findIndex(c => c.id === this.editClass.id);
        if (index !== -1) {
          this.classes[index] = updatedClass;
          this.filteredClasses = [...this.classes];
        }
        
        this.closeEditModal();
        
        this.notificationService.addNotification({
          title: 'Class Updated',
          message: `${className} information has been updated`,
          type: 'success',
          read: false,
          icon: 'bi-pencil-fill'
        });

        this.showSuccessMessage('Class Updated Successfully!', `${className} has been updated`, 'bi-pencil-square');
      },
      error: (error) => {
        console.error('Error updating class:', error);
        alert('Failed to update class. Please try again.');
      }
    });
  }

  openDeleteModal(cls: Class): void {
    if (!this.canDelete()) {
      alert('You do not have permission to delete classes');
      return;
    }

    this.classToDelete = cls;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.classToDelete = null;
  }

  confirmDelete(): void {
    if (!this.classToDelete) return;

    const cls = this.classToDelete;

    this.classService.delete(cls.id).subscribe({
      next: () => {
        this.classes = this.classes.filter(c => c.id !== cls.id);
        this.filteredClasses = this.filteredClasses.filter(c => c.id !== cls.id);
        
        this.closeDeleteModal();
        
        this.notificationService.addNotification({
          title: 'Class Deleted',
          message: `${cls.name} has been removed`,
          type: 'error',
          read: false,
          icon: 'bi-trash-fill'
        });

        this.showSuccessMessage('Class Deleted!', `${cls.name} has been removed`, 'bi-trash-fill');
      },
      error: (error) => {
        console.error('Error deleting class:', error);
        alert('Failed to delete class. Please try again.');
      }
    });
  }

  showSuccessMessage(title: string, message: string, icon: string): void {
    this.successMessage = message;
    this.successIcon = icon;
    this.showSuccessModal = true;

    setTimeout(() => {
      this.showSuccessModal = false;
    }, 3000);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

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
    return true;
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    if (menu === 'dashboard') this.router.navigate(['/dashboard']);
    else if (menu === 'students') this.router.navigate(['/students']);
    else if (menu === 'teachers') this.router.navigate(['/teachers']);
    else if (menu === 'classes') this.router.navigate(['/classes']);
    else if (menu === 'attendance') this.router.navigate(['/attendance']);
    else if (menu === 'fees') this.router.navigate(['/fees']);
    else if (menu === 'setting') this.router.navigate(['/settings']);
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
    this.showNotificationDropdown = false;
  }

  deleteNotification(id: number, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(id);
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  }

  onLogout(): void {
    this.authService.logout();
  }

  getRoleBadgeClass(): string {
    switch (this.userRole) {
      case 'admin': return 'role-badge-admin';
      case 'manager': return 'role-badge-manager';
      case 'user': return 'role-badge-user';
      case 'guest': return 'role-badge-guest';
      default: return 'role-badge-user';
    }
  }
}
