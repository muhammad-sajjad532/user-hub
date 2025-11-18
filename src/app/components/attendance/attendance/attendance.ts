import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';

interface AttendanceRecord {
  id: number;
  date: string;
  studentId: number;
  studentName: string;
  class: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  remarks: string;
}

interface Student {
  id: number;
  name: string;
  class: string;
  rollNumber: string;
}

@Component({
  selector: 'app-attendance',
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css',
})
export class Attendance implements OnInit {
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'attendance';

  attendanceRecords: AttendanceRecord[] = [];
  students: Student[] = [];
  filteredStudents: Student[] = [];
  filteredRecords: AttendanceRecord[] = [];
  searchQuery: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedClass: string = 'all';
  classes: string[] = [];
  
  showSuccessModal: boolean = false;
  successMessage: string = '';
  successIcon: string = '';

  // Statistics
  totalPresent: number = 0;
  totalAbsent: number = 0;
  totalLate: number = 0;
  attendancePercentage: number = 0;

  private attendanceUrl = 'http://localhost:3000/attendance';
  private studentsUrl = 'http://localhost:3000/students';

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
    this.loadAttendance();
  }

  loadStudents(): void {
    this.http.get<Student[]>(this.studentsUrl).subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = [...data];
        // Extract unique classes
        this.classes = [...new Set(data.map(s => s.class))].sort();
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  loadAttendance(): void {
    this.http.get<AttendanceRecord[]>(this.attendanceUrl).subscribe({
      next: (data) => {
        this.attendanceRecords = data;
        this.filterAttendance();
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        alert('Failed to load attendance. Please make sure JSON Server is running on port 3000.');
      }
    });
  }

  filterAttendance(): void {
    // Filter attendance records
    let filteredRecords = this.attendanceRecords.filter(record => record.date === this.selectedDate);
    
    if (this.selectedClass !== 'all') {
      filteredRecords = filteredRecords.filter(record => record.class === this.selectedClass);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredRecords = filteredRecords.filter(record =>
        record.studentName.toLowerCase().includes(query) ||
        record.class.toLowerCase().includes(query)
      );
    }

    this.filteredRecords = filteredRecords;

    // Filter students list
    let filteredStudents = [...this.students];
    
    if (this.selectedClass !== 'all') {
      filteredStudents = filteredStudents.filter(student => student.class === this.selectedClass);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query) ||
        student.rollNumber.toLowerCase().includes(query)
      );
    }

    this.filteredStudents = filteredStudents;
    this.calculateStatistics();
  }

  calculateStatistics(): void {
    this.totalPresent = this.filteredRecords.filter(r => r.status === 'present').length;
    this.totalAbsent = this.filteredRecords.filter(r => r.status === 'absent').length;
    this.totalLate = this.filteredRecords.filter(r => r.status === 'late').length;
    
    const total = this.filteredRecords.length;
    this.attendancePercentage = total > 0 ? Math.round((this.totalPresent / total) * 100) : 0;
  }

  markAttendance(studentId: number, status: 'present' | 'absent' | 'late'): void {
    if (!this.canMark()) {
      alert('You do not have permission to mark attendance');
      return;
    }

    const student = this.students.find(s => s.id === studentId);
    if (!student) return;

    const existingRecord = this.attendanceRecords.find(
      r => r.studentId === studentId && r.date === this.selectedDate
    );

    if (existingRecord) {
      // Update existing record
      const updatedRecord = { ...existingRecord, status, markedBy: this.userName };
      
      this.http.put<AttendanceRecord>(`${this.attendanceUrl}/${existingRecord.id}`, updatedRecord).subscribe({
        next: (updated) => {
          const index = this.attendanceRecords.findIndex(r => r.id === existingRecord.id);
          if (index !== -1) {
            this.attendanceRecords[index] = updated;
          }
          this.filterAttendance();
          this.showSuccessMessage('Attendance Updated!', `${student.name} marked as ${status}`, 'bi-check-circle-fill');
        },
        error: (error) => {
          console.error('Error updating attendance:', error);
          alert('Failed to update attendance');
        }
      });
    } else {
      // Create new record
      const newRecord = {
        date: this.selectedDate,
        studentId: student.id,
        studentName: student.name,
        class: student.class,
        status,
        markedBy: this.userName,
        remarks: ''
      };

      this.http.post<AttendanceRecord>(this.attendanceUrl, newRecord).subscribe({
        next: (created) => {
          this.attendanceRecords.push(created);
          this.filterAttendance();
          this.showSuccessMessage('Attendance Marked!', `${student.name} marked as ${status}`, 'bi-check-circle-fill');
        },
        error: (error) => {
          console.error('Error marking attendance:', error);
          alert('Failed to mark attendance');
        }
      });
    }
  }

  getStudentStatus(studentId: number): 'present' | 'absent' | 'late' | null {
    const record = this.attendanceRecords.find(
      r => r.studentId === studentId && r.date === this.selectedDate
    );
    return record ? record.status : null;
  }

  showSuccessMessage(title: string, message: string, icon: string): void {
    this.successMessage = message;
    this.successIcon = icon;
    this.showSuccessModal = true;

    setTimeout(() => {
      this.showSuccessModal = false;
    }, 2000);
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }

  canMark(): boolean {
    return ['admin', 'manager', 'user'].includes(this.userRole);
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
