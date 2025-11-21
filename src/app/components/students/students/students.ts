import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';
import { StudentService, Student } from '../../../services/student.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private studentService: StudentService
  ) { }

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
    this.studentService.getAll().subscribe((data) => {
      this.students = data;
      this.filteredStudents = [...data];
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

    const { name, class: studentClass } = this.newStudent;
    const { id, ...studentData } = this.newStudent;

    this.studentService.create(studentData).subscribe((saved) => {
      this.students.push(saved);
      this.filteredStudents = [...this.students];
      this.closeAddModal();
      this.notificationService.addNotification({
        title: 'New Student Added',
        message: `${name} has been admitted to ${studentClass}`,
        type: 'success',
        read: false,
        icon: 'bi-person-plus-fill'
      });
      this.showSuccessMessage('Student Added Successfully!', `${name} has been added to ${studentClass}`, 'bi-check-circle-fill');
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

    const { name, id } = this.editStudent;

    this.studentService.update(id, this.editStudent).subscribe((updated) => {
      const index = this.students.findIndex(s => s.id === id);
      if (index !== -1) {
        this.students[index] = updated;
        this.filteredStudents = [...this.students];
      }
      this.closeEditModal();
      this.notificationService.addNotification({
        title: 'Student Updated',
        message: `${name}'s information has been updated`,
        type: 'success',
        read: false,
        icon: 'bi-pencil-fill'
      });
      this.showSuccessMessage('Student Updated Successfully!', `${name}'s information has been updated`, 'bi-pencil-square');
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

    const { id, name } = this.studentToDelete;

    this.studentService.delete(id).subscribe(() => {
      this.students = this.students.filter(s => s.id !== id);
      this.filteredStudents = this.filteredStudents.filter(s => s.id !== id);
      this.closeDeleteModal();
      this.notificationService.addNotification({
        title: 'Student Deleted',
        message: `${name} has been removed from records`,
        type: 'error',
        read: false,
        icon: 'bi-trash-fill'
      });
      this.showSuccessMessage('Student Deleted!', `${name} has been removed from records`, 'bi-trash-fill');
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
