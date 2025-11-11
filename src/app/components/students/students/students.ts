import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  selectedStudent: Student | null = null;
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

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
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
    // Mock data - Replace with API call
    this.students = [
      { id: 1, name: 'Ahmed Ali', fatherName: 'Ali Khan', class: '10-A', rollNumber: '101', phone: '0300-1234567', address: 'Karachi', admissionDate: '2024-01-15', feeStatus: 'paid' },
      { id: 2, name: 'Sara Khan', fatherName: 'Khan Sahib', class: '9-B', rollNumber: '205', phone: '0301-2345678', address: 'Lahore', admissionDate: '2024-02-20', feeStatus: 'pending' },
      { id: 3, name: 'Fatima Noor', fatherName: 'Noor Ahmed', class: '10-A', rollNumber: '102', phone: '0302-3456789', address: 'Islamabad', admissionDate: '2024-01-10', feeStatus: 'paid' },
      { id: 4, name: 'Hassan Raza', fatherName: 'Raza Ali', class: '8-C', rollNumber: '308', phone: '0303-4567890', address: 'Karachi', admissionDate: '2024-03-05', feeStatus: 'pending' },
      { id: 5, name: 'Ayesha Malik', fatherName: 'Malik Sahib', class: '9-A', rollNumber: '201', phone: '0304-5678901', address: 'Lahore', admissionDate: '2024-02-15', feeStatus: 'paid' },
    ];
    this.filteredStudents = [...this.students];
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

    this.newStudent.id = this.students.length + 1;
    this.students.push({ ...this.newStudent });
    this.filteredStudents = [...this.students];
    this.closeAddModal();
    
    this.notificationService.addNotification({
      title: 'New Student Added',
      message: `${this.newStudent.name} has been admitted to ${this.newStudent.class}`,
      type: 'success',
      read: false,
      icon: 'bi-person-plus-fill'
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

    const index = this.students.findIndex(s => s.id === this.editStudent.id);
    if (index !== -1) {
      this.students[index] = { ...this.editStudent };
      this.filteredStudents = [...this.students];
      this.closeEditModal();
      
      this.notificationService.addNotification({
        title: 'Student Updated',
        message: `${this.editStudent.name}'s information has been updated`,
        type: 'success',
        read: false,
        icon: 'bi-pencil-fill'
      });
    }
  }

  deleteStudent(id: number): void {
    // Check if user has permission to delete
    if (!this.canDelete()) {
      alert('You do not have permission to delete students');
      return;
    }

    if (confirm('Are you sure you want to delete this student?')) {
      const student = this.students.find(s => s.id === id);
      this.students = this.students.filter(s => s.id !== id);
      this.filteredStudents = this.filteredStudents.filter(s => s.id !== id);
      
      if (student) {
        this.notificationService.addNotification({
          title: 'Student Deleted',
          message: `${student.name} has been removed from records`,
          type: 'error',
          read: false,
          icon: 'bi-trash-fill'
        });
      }
    }
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
