import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { NotificationService, Notification } from '../../../services/notification';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  // User data (loaded from AuthService in ngOnInit)
  userName: string = '';
  userRole: string = '';
  notificationCount: number = 0;
  
  // Notifications
  notifications: Notification[] = [];
  showNotificationDropdown: boolean = false;

  // Sidebar state
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'dashboard';

  // Error message from route guard
  errorMessage: string = '';

  // Dashboard statistics
  totalStudents: number = 0;
  totalTeachers: number = 0;
  presentStudents: number = 0;
  attendancePercentage: number = 0;
  pendingFees: number = 0;
  pendingFeeStudents: number = 0;



  // Quick actions
  quickActions = [
    { icon: 'bi-person-plus', title: 'Add Student', description: 'Register new student', route: '/students', color: 'blue' },
    { icon: 'bi-person-badge', title: 'Add Teacher', description: 'Register new teacher', route: '/teachers', color: 'green' },
    { icon: 'bi-calendar-check', title: 'Mark Attendance', description: 'Take today\'s attendance', route: '/attendance', color: 'purple' },
    { icon: 'bi-cash-stack', title: 'Collect Fee', description: 'Record fee payment', route: '/fees', color: 'orange' }
  ];

  // Chart.js configuration for Monthly Turnover
  public barChartType: ChartType = 'bar';
  
  public barChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Turnover',
        data: [45000, 25000, 75000, 40000, 30000, 80000, 35000, 75000, 40000, 60000, 35000, 55000],
        backgroundColor: 'rgba(107, 114, 128, 0.8)', // Gray matching login button
        borderColor: 'rgba(107, 114, 128, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(75, 85, 99, 0.9)',
        hoverBorderColor: 'rgba(75, 85, 99, 1)',
      }
    ]
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Hide legend since we only have one dataset
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(30, 58, 95, 1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            if (value !== null && value !== undefined) {
              return `Turnover: $${value.toLocaleString()}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)'
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12
          },
          callback: (value) => {
            if (typeof value === 'number') {
              return '$' + (value / 1000) + 'K';
            }
            return value;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Get user info from auth service
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole() || 'user';

    // Load notifications
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
      this.notificationCount = this.notificationService.getUnreadCount();
    });

    // Load dashboard statistics
    this.loadStatistics();



    // Check for error messages from route guards
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        if (params['error'] === 'access_denied') {
          this.errorMessage = '⚠️ Access Denied: You do not have permission to access that page.';
        } else if (params['error'] === 'insufficient_permissions') {
          this.errorMessage = '⚠️ Insufficient Permissions: You need additional permissions to access that page.';
        }

        // Clear error message after 5 seconds
        if (this.errorMessage) {
          setTimeout(() => {
            this.errorMessage = '';
            // Remove query params from URL
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: {},
              replaceUrl: true
            });
          }, 5000);
        }
      }
    });
  }

  // Get role badge color
  getRoleBadgeClass(): string {
    switch (this.userRole) {
      case 'admin':
        return 'role-badge-admin';
      case 'manager':
        return 'role-badge-manager';
      case 'user':
        return 'role-badge-user';
      case 'guest':
        return 'role-badge-guest';
      default:
        return 'role-badge-user';
    }
  }

  // Toggle sidebar collapse
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Set active menu
  setActiveMenu(menu: string): void {
    this.activeMenu = menu;
    console.log('Active menu:', menu);
    
    // Navigate to different pages based on menu selection
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

  // Handle logout
  onLogout(): void {
    // Logout via auth service (handles everything)
    this.authService.logout();
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

  // Load dashboard statistics
  loadStatistics(): void {
    // Mock school data - Replace with actual API calls
    this.totalStudents = 450;
    this.totalTeachers = 35;
    this.presentStudents = 423;
    this.attendancePercentage = Math.round((this.presentStudents / this.totalStudents) * 100);
    this.pendingFees = 125000;
    this.pendingFeeStudents = 28;
  }



  // Navigate to quick action
  navigateToAction(route: string): void {
    this.router.navigate([route]);
  }
}
