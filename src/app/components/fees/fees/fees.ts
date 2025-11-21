import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { NotificationService, Notification } from '../../../services/notification';
import { FeeService, FeeRecord } from '../../../services/fee.service';

@Component({
  selector: 'app-fees',
  imports: [CommonModule, FormsModule],
  templateUrl: './fees.html',
  styleUrl: './fees.css',
})
export class Fees implements OnInit {
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'fees';

  feeRecords: FeeRecord[] = [];
  filteredRecords: FeeRecord[] = [];
  searchQuery: string = '';
  selectedStatus: string = 'all';
  
  showPaymentModal: boolean = false;
  showSuccessModal: boolean = false;
  selectedRecord: FeeRecord | null = null;
  paymentAmount: number = 0;
  paymentDate: string = new Date().toISOString().split('T')[0];
  successMessage: string = '';
  successIcon: string = '';

  // Statistics
  totalCollected: number = 0;
  totalPending: number = 0;
  totalStudents: number = 0;
  collectionPercentage: number = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService,
    private feeService: FeeService
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole() || 'user';
    
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notificationService.getUnreadCount();
    });

    this.loadFees();
  }

  loadFees(): void {
    this.feeService.getAll().subscribe({
      next: (data) => {
        this.feeRecords = data;
        this.filteredRecords = [...data];
        this.calculateStatistics();
      },
      error: (error) => {
        console.error('Error loading fees:', error);
        alert('Failed to load fee records. Please make sure JSON Server is running on port 3000.');
      }
    });
  }

  filterRecords(): void {
    let filtered = [...this.feeRecords];

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.status === this.selectedStatus);
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(query) ||
        record.rollNumber.toLowerCase().includes(query) ||
        record.class.toLowerCase().includes(query)
      );
    }

    this.filteredRecords = filtered;
  }

  calculateStatistics(): void {
    this.totalCollected = this.feeRecords.reduce((sum, record) => sum + record.totalPaid, 0);
    this.totalPending = this.feeRecords.reduce((sum, record) => sum + record.totalPending, 0);
    this.totalStudents = this.feeRecords.length;
    
    const totalFees = this.totalCollected + this.totalPending;
    this.collectionPercentage = totalFees > 0 ? Math.round((this.totalCollected / totalFees) * 100) : 0;
  }

  openPaymentModal(record: FeeRecord): void {
    if (!this.canCollect()) {
      alert('You do not have permission to collect fees');
      return;
    }

    this.selectedRecord = record;
    this.paymentAmount = record.totalPending;
    this.paymentDate = new Date().toISOString().split('T')[0];
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.selectedRecord = null;
    this.paymentAmount = 0;
  }

  collectPayment(): void {
    if (!this.selectedRecord || this.paymentAmount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (this.paymentAmount > this.selectedRecord.totalPending) {
      alert('Payment amount cannot exceed pending amount');
      return;
    }

    const newStatus: 'paid' | 'pending' | 'partial' = 
      (this.selectedRecord.totalPending - this.paymentAmount) === 0 ? 'paid' : 
      (this.selectedRecord.totalPaid + this.paymentAmount) > 0 ? 'partial' : 'pending';

    const updatedRecord: FeeRecord = {
      ...this.selectedRecord,
      totalPaid: this.selectedRecord.totalPaid + this.paymentAmount,
      totalPending: this.selectedRecord.totalPending - this.paymentAmount,
      lastPaymentDate: this.paymentDate,
      lastPaymentAmount: this.paymentAmount,
      status: newStatus
    };

    this.feeService.update(this.selectedRecord.id, updatedRecord).subscribe({
      next: (updated) => {
        const index = this.feeRecords.findIndex(r => r.id === this.selectedRecord!.id);
        if (index !== -1) {
          this.feeRecords[index] = updated;
          this.filteredRecords = [...this.feeRecords];
          this.calculateStatistics();
        }

        this.notificationService.addNotification({
          title: 'Payment Collected',
          message: `₨${this.paymentAmount} received from ${this.selectedRecord!.studentName}`,
          type: 'success',
          read: false,
          icon: 'bi-cash-coin'
        });

        this.closePaymentModal();
        this.showSuccessMessage('Payment Collected!', `₨${this.paymentAmount} received from ${this.selectedRecord!.studentName}`, 'bi-check-circle-fill');
      },
      error: (error) => {
        console.error('Error collecting payment:', error);
        alert('Failed to collect payment. Please try again.');
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

  canCollect(): boolean {
    return ['admin', 'manager'].includes(this.userRole);
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
