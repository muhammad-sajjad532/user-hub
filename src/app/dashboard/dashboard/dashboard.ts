import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  // User data
  userName: string = 'Zeeshan Khan';
  notificationCount: number = 5;

  // Sidebar state
  isSidebarCollapsed: boolean = false;
  activeMenu: string = 'dashboard';

  // Dashboard statistics
  totalUsers: number = 50000;
  monthlyUsers: number = 3500;

  // Monthly turnover chart data (different heights for each month)
  monthlyTurnoverData: number[] = [45, 25, 75, 40, 30, 80, 35, 75, 40, 60, 35, 55];
  chartMonths: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get user name from auth service
    this.userName = this.authService.getUserName();
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

  // Get chart bar height based on value
  getBarHeight(value: number): string {
    return `${value}%`;
  }

}
