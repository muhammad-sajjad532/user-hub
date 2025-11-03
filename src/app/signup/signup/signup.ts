import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class Signup {
  // Form data variables
  fullName: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  agreeToTerms: boolean = false;

  // Error messages
  fullNameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';
  termsError: string = '';

  constructor(private router: Router) {}

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Validate full name
  validateFullName(): boolean {
    if (!this.fullName.trim()) {
      this.fullNameError = 'Full name is required';
      return false;
    } else if (this.fullName.trim().length < 3) {
      this.fullNameError = 'Full name must be at least 3 characters';
      return false;
    } else {
      this.fullNameError = '';
      return true;
    }
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

  // Validate confirm password
  validateConfirmPassword(): boolean {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Please confirm your password';
      return false;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Passwords do not match';
      return false;
    } else {
      this.confirmPasswordError = '';
      return true;
    }
  }

  // Validate terms checkbox
  validateTerms(): boolean {
    if (!this.agreeToTerms) {
      this.termsError = 'You must agree to the terms and conditions';
      return false;
    } else {
      this.termsError = '';
      return true;
    }
  }

  // Handle form submission
  onSubmit(): void {
    // Validate all fields
    const isFullNameValid = this.validateFullName();
    const isEmailValid = this.validateEmail();
    const isPasswordValid = this.validatePassword();
    const isConfirmPasswordValid = this.validateConfirmPassword();
    const isTermsValid = this.validateTerms();

    if (isFullNameValid && isEmailValid && isPasswordValid && 
        isConfirmPasswordValid && isTermsValid) {
      // Here you would typically call a registration service
      console.log('Sign up attempt:', {
        fullName: this.fullName,
        email: this.email,
        password: this.password
      });
      
      // For now, just show success message
      alert('Sign up successful! Please login.');
      
      // Navigate to login page
      this.router.navigate(['/login']);
    }
  }

  // Navigate to login page
  onLogin(): void {
    this.router.navigate(['/login']);
  }

}
