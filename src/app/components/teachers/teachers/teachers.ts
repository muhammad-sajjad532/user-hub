import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';

interface Teacher {
  id: number;
  name: string;
  qualification: string;
  subject: string;
  phone: string;
  email: string;
  address: string;
  joiningDate: string;
  salary: number;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-teachers',
  imports: [CommonModule, FormsModule],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class Teachers implements OnInit {
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'teachers';

  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  searchQuery: string = '';
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  showEditModal: boolean = false;
  showSuccessModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedTeacher: Teacher | null = null;
  teacherToDelete: Teacher | null = null;
  successMessage: string = '';
  successIcon: string = '';
  
  newTeacher: Teacher = {
    id: 0,
    name: '',
    qualification: '',
    subject: '',
    phone: '',
    email: '',
    address: '',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: 0,
    status: 'active'
  };

  editTeacher: Teacher = {
    id: 0,
    name: '',
    qualification: '',
    subject: '',
    phone: '',
    email: '',
    address: '',
    joiningDate: '',
    salary: 0,
    status: 'active'
  };

  private apiUrl = 'http://localhost:3000/teachers';

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole() || 'user';
    
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notificationService.getUnreadCount();
    });

    this.loadTeachers();
  }

  loadTeachers(): void {
    this.http.get<Teacher[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.teachers = data;
        this.filteredTeachers = [...this.teachers];
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        alert('Failed to load teachers. Please make sure JSON Server is running on port 3000.');
      }
    });
  }

  searchTeachers(): void {
    if (!this.searchQuery.trim()) {
      this.filteredTeachers = [...this.teachers];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredTeachers = this.teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(query) ||
      teacher.subject.toLowerCase().includes(query) ||
      teacher.email.toLowerCase().includes(query)
    );
  }

  openAddModal(): void {
    if (!this.canAdd()) {
      alert('You do not have permission to add teachers');
      return;
    }
    this.showAddModal = true;
    this.newTeacher = {
      id: 0,
      name: '',
      qualification: '',
      subject: '',
      phone: '',
      email: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      salary: 0,
      status: 'active'
    };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addTeacher(): void {
    if (!this.newTeacher.name || !this.newTeacher.subject || !this.newTeacher.email) {
      alert('Please fill all required fields');
      return;
    }

    const teacherName = this.newTeacher.name;
    const { id, ...teacherData } = this.newTeacher;

    this.http.post<Teacher>(this.apiUrl, teacherData).subscribe({
      next: (savedTeacher) => {
        this.teachers.push(savedTeacher);
        this.filteredTeachers = [...this.teachers];
        this.closeAddModal();
        
        this.notificationService.addNotification({
          title: 'New Teacher Added',
          message: `${teacherName} has been added to staff`,
          type: 'success',
          read: false,
          icon: 'bi-person-plus-fill'
        });

        this.showSuccessMessage('Teacher Added Successfully!', `${teacherName} has been added to staff`, 'bi-check-circle-fill');
      },
      error: (error) => {
        console.error('Error adding teacher:', error);
        alert('Failed to add teacher. Please try again.');
      }
    });
  }

  viewTeacher(teacher: Teacher): void {
    this.selectedTeacher = teacher;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTeacher = null;
  }

  openEditModal(teacher: Teacher): void {
    if (!this.canEdit()) {
      alert('You do not have permission to edit teachers');
      return;
    }
    this.editTeacher = { ...teacher };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  updateTeacher(): void {
    if (!this.editTeacher.name || !this.editTeacher.subject || !this.editTeacher.email) {
      alert('Please fill all required fields');
      return;
    }

    const teacherName = this.editTeacher.name;

    this.http.put<Teacher>(`${this.apiUrl}/${this.editTeacher.id}`, this.editTeacher).subscribe({
      next: (updatedTeacher) => {
        const index = this.teachers.findIndex(t => t.id === this.editTeacher.id);
        if (index !== -1) {
          this.teachers[index] = updatedTeacher;
          this.filteredTeachers = [...this.teachers];
        }
        
        this.closeEditModal();
        
        this.notificationService.addNotification({
          title: 'Teacher Updated',
          message: `${teacherName}'s information has been updated`,
          type: 'success',
          read: false,
          icon: 'bi-pencil-fill'
        });

        this.showSuccessMessage('Teacher Updated Successfully!', `${teacherName}'s information has been updated`, 'bi-pencil-square');
      },
      error: (error) => {
        console.error('Error updating teacher:', error);
        alert('Failed to update teacher. Please try again.');
      }
    });
  }

  openDeleteModal(teacher: Teacher): void {
    if (!this.canDelete()) {
      alert('You do not have permission to delete teachers');
      return;
    }

    this.teacherToDelete = teacher;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.teacherToDelete = null;
  }

  confirmDelete(): void {
    if (!this.teacherToDelete) return;

    const teacher = this.teacherToDelete;

    this.http.delete(`${this.apiUrl}/${teacher.id}`).subscribe({
      next: () => {
        this.teachers = this.teachers.filter(t => t.id !== teacher.id);
        this.filteredTeachers = this.filteredTeachers.filter(t => t.id !== teacher.id);
        
        this.closeDeleteModal();
        
        this.notificationService.addNotification({
          title: 'Teacher Deleted',
          message: `${teacher.name} has been removed from staff`,
          type: 'error',
          read: false,
          icon: 'bi-trash-fill'
        });

        this.showSuccessMessage('Teacher Deleted!', `${teacher.name} has been removed from staff`, 'bi-trash-fill');
      },
      error: (error) => {
        console.error('Error deleting teacher:', error);
        alert('Failed to delete teacher. Please try again.');
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
