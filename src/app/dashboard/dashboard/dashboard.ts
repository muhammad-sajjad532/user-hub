import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  // User data
  userName: string = 'Zeeshan Khan';
  userRole: string = 'user';
  notificationCount: number = 5;

  // Sidebar state
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'dashboard';

  // Error message from route guard
  errorMessage: string = '';

  // Dashboard statistics
  totalUsers: number = 50000;
  monthlyUsers: number = 3500;

  // Chart.js configuration for Monthly Turnover
  public barChartType: ChartType = 'bar';
  
  public barChartData: ChartConfiguration['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Turnover',
        data: [45000, 25000, 75000, 40000, 30000, 80000, 35000, 75000, 40000, 60000, 35000, 55000],
        backgroundColor: 'rgba(30, 58, 95, 0.8)', // Dark blue matching your design
        borderColor: 'rgba(30, 58, 95, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(0, 51, 102, 0.9)',
        hoverBorderColor: 'rgba(0, 51, 102, 1)',
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user info from auth service
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole() || 'user';

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
    if (menu === 'users') {
      this.router.navigate(['/users']);
    } else if (menu === 'dashboard') {
      this.router.navigate(['/dashboard']);
    }
  }

  // Handle logout
  onLogout(): void {
    // Logout via auth service (handles everything)
    this.authService.logout();
  }
}
