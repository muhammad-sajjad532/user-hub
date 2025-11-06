import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth';


@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Form data variables
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  // Error messages
  emailError: string = '';
  passwordError: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('LoginComponent initialized');
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Validate email format
  validateEmail(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'Email is required';
      return false;
    } else if (!emailPattern.test(this.email)) {
      this.emailError = 'Please enter a valid email';
      return false;
    } else {
      this.emailError = '';
      return true;
    }
  }

  // Validate password
  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    } else if (this.password.length < 6) {
      this.passwordError = 'Password must be at least 6 characters';
      return false;
    } else {
      this.passwordError = '';
      return true;
    }
  }

  // Handle form submission
  onSubmit(): void {
    console.log('=== LOGIN BUTTON CLICKED ===');
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    
    // Simple validation - just check if fields are not empty
    if (!this.email || !this.password) {
      alert('Please enter both email and password');
      return;
    }
    
    // Login via AuthService (now returns Observable)
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ Login successful');
          alert(`Welcome ${user.name}! You are logged in as ${user.role.toUpperCase()}.`);
          
          // Check if there's a redirect URL (from auth guard)
          const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard';
          sessionStorage.removeItem('redirectUrl');
          
          // Navigate to redirect URL or dashboard
          this.router.navigate([redirectUrl]).then(
            (success) => console.log('Navigation success:', success),
            (error) => console.error('Navigation error:', error)
          );
        } else {
          console.log('❌ Login failed');
          alert('Login failed. Invalid email or password.');
        }
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        alert('Login error. Please try again.');
      }
    });
  }

  // Navigate to forgot password page
  onForgotPassword(): void {
    console.log('Forgot password clicked');
    // this.router.navigate(['/forgot-password']);
  }

  // Navigate to signup page
  onSignUp(): void {
    console.log('Sign up clicked');
    this.router.navigate(['/signup']);
  }
}
