import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';

interface Student {
  id: number;
  name: string;
  fatherName: string;
  class: string;
  rollNumber: string;
  phone: string;
  address: string;
  admissionDate: string;
  feeStatus: 'paid' | 'pending';
}

@Component({
  selector: 'app-students',
  imports: [CommonModule, FormsModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students implements OnInit {
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'students';

  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchQuery: string = '';
  showAddModal: boolean = false;
  
  newStudent: Student = {
    id: 0,
    name: '',
    fatherName: '',
    class: '',
    rollNumber: '',
    phone: '',
    address: '',
    admissionDate: new Date().toISOString().split('T')[0],
    feeStatus: 'pending'
  };

  showViewModal: boolean = false;
  showEditModal: boolean = false;
  showSuccessModal: boolean = false;
  showDeleteModal: boolean = false;
  selectedStudent: Student | null = null;
  studentToDelete: Student | null = null;
  successMessage: string = '';
  successIcon: string = '';
  editStudent: Student = {
    id: 0,
    name: '',
    fatherName: '',
    class: '',
    rollNumber: '',
    phone: '',
    address: '',
    admissionDate: '',
    feeStatus: 'pending'
  };

  private apiUrl = 'http://localhost:3000/students';

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

    this.loadStudents();
  }

  loadStudents(): void {
    // Load students from JSON Server
    this.http.get<Student[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...this.students];
      },
      error: (error) => {
        console.error('Error loading students:', error);
        alert('Failed to load students. Please make sure JSON Server is running on port 3000.');
      }
    });
  }

  searchStudents(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStudents = [...this.students];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.name.toLowerCase().includes(query) ||
      student.rollNumber.toLowerCase().includes(query) ||
      student.class.toLowerCase().includes(query)
    );
  }

  openAddModal(): void {
    // Check if user has permission to add
    if (!this.canAdd()) {
      alert('You do not have permission to add students');
      return;
    }
    this.showAddModal = true;
    this.newStudent = {
      id: 0,
      name: '',
      fatherName: '',
      class: '',
      rollNumber: '',
      phone: '',
      address: '',
      admissionDate: new Date().toISOString().split('T')[0],
      feeStatus: 'pending'
    };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  addStudent(): void {
    if (!this.newStudent.name || !this.newStudent.class || !this.newStudent.rollNumber) {
      alert('Please fill all required fields');
      return;
    }

    const studentName = this.newStudent.name;
    const studentClass = this.newStudent.class;

    // Remove id as JSON Server will auto-generate it
    const { id, ...studentData } = this.newStudent;

    // Save to JSON Server
    this.http.post<Student>(this.apiUrl, studentData).subscribe({
      next: (savedStudent) => {
        this.students.push(savedStudent);
        this.filteredStudents = [...this.students];
        
        this.closeAddModal();
        
        this.notificationService.addNotification({
          title: 'New Student Added',
          message: `${studentName} has been admitted to ${studentClass}`,
          type: 'success',
          read: false,
          icon: 'bi-person-plus-fill'
        });

        this.showSuccessMessage('Student Added Successfully!', `${studentName} has been added to ${studentClass}`, 'bi-check-circle-fill');
      },
      error: (error) => {
        console.error('Error adding student:', error);
        alert('Failed to add student. Please try again.');
      }
    });
  }

  viewStudent(student: Student): void {
    this.selectedStudent = student;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedStudent = null;
  }

  openEditModal(student: Student): void {
    // Check if user has permission to edit
    if (!this.canEdit()) {
      alert('You do not have permission to edit students');
      return;
    }
    this.editStudent = { ...student };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  updateStudent(): void {
    if (!this.editStudent.name || !this.editStudent.class || !this.editStudent.rollNumber) {
      alert('Please fill all required fields');
      return;
    }

    const studentName = this.editStudent.name;

    // Update in JSON Server
    this.http.put<Student>(`${this.apiUrl}/${this.editStudent.id}`, this.editStudent).subscribe({
      next: (updatedStudent) => {
        const index = this.students.findIndex(s => s.id === this.editStudent.id);
        if (index !== -1) {
          this.students[index] = updatedStudent;
          this.filteredStudents = [...this.students];
        }
        
        this.closeEditModal();
        
        this.notificationService.addNotification({
          title: 'Student Updated',
          message: `${studentName}'s information has been updated`,
          type: 'success',
          read: false,
          icon: 'bi-pencil-fill'
        });

        this.showSuccessMessage('Student Updated Successfully!', `${studentName}'s information has been updated`, 'bi-pencil-square');
      },
      error: (error) => {
        console.error('Error updating student:', error);
        alert('Failed to update student. Please try again.');
      }
    });
  }

  openDeleteModal(student: Student): void {
    // Check if user has permission to delete
    if (!this.canDelete()) {
      alert('You do not have permission to delete students');
      return;
    }

    this.studentToDelete = student;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.studentToDelete = null;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;

    const student = this.studentToDelete;

    // Delete from JSON Server
    this.http.delete(`${this.apiUrl}/${student.id}`).subscribe({
      next: () => {
        this.students = this.students.filter(s => s.id !== student.id);
        this.filteredStudents = this.filteredStudents.filter(s => s.id !== student.id);
        
        this.closeDeleteModal();
        
        this.notificationService.addNotification({
          title: 'Student Deleted',
          message: `${student.name} has been removed from records`,
          type: 'error',
          read: false,
          icon: 'bi-trash-fill'
        });

        this.showSuccessMessage('Student Deleted!', `${student.name} has been removed from records`, 'bi-trash-fill');
      },
      error: (error) => {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
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

  // Role-based permission checks
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
    return true; // All authenticated users can view
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
