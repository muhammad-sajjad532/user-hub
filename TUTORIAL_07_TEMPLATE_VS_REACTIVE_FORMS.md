# 📝 Tutorial 07: Template-Driven vs Reactive Forms - Complete Guide

## 🎯 Forms in Angular

Angular mein **2 types** ke forms hain:
1. **Template-Driven Forms** (Current - Simple)
2. **Reactive Forms** (Advanced - Powerful)

---

## 📊 Quick Comparison

| Feature | Template-Driven | Reactive |
|---------|----------------|----------|
| **Setup** | Easy | Complex |
| **Code Location** | Template (HTML) | Component (TS) |
| **Data Flow** | Two-way binding | One-way binding |
| **Validation** | Template | Component |
| **Testing** | Hard | Easy |
| **Dynamic Forms** | Hard | Easy |
| **Best For** | Simple forms | Complex forms |

---

## 1️⃣ Template-Driven Forms (Current Approach)

### 📍 What is it?

Form logic **template (HTML)** mein hoti hai. Angular automatically form model create karta hai.

### 🔧 Setup

```typescript
// Component
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  // ...
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  
  onSubmit() {
    console.log(this.username, this.password);
  }
}
```

```html
<!-- Template -->
<form #loginForm="ngForm" (ngSubmit)="onSubmit()">
  <input 
    [(ngModel)]="username" 
    name="username" 
    required 
    minlength="3">
  
  <input 
    [(ngModel)]="password" 
    name="password" 
    type="password" 
    required>
  
  <button [disabled]="!loginForm.valid">Login</button>
</form>
```

### 📝 Key Features:

#### **1. Two-Way Binding: `[(ngModel)]`**
```html
<input [(ngModel)]="username" name="username">
```

**How it works:**
```
User types "Ali"
      ↓
Template updates
      ↓
Component variable updates
username = "Ali"
      ↓
Display anywhere: {{ username }}
```

#### **2. Template Reference: `#loginForm="ngForm"`**
```html
<form #loginForm="ngForm">
  <!-- Access form state -->
  <p>Valid: {{ loginForm.valid }}</p>
  <p>Touched: {{ loginForm.touched }}</p>
  <p>Dirty: {{ loginForm.dirty }}</p>
</form>
```

#### **3. Built-in Validators**
```html
<input 
  [(ngModel)]="email" 
  name="email"
  required 
  email 
  minlength="5"
  maxlength="50">

<!-- Show errors -->
<div *ngIf="emailField.invalid && emailField.touched">
  <span *ngIf="emailField.errors?.['required']">Email required</span>
  <span *ngIf="emailField.errors?.['email']">Invalid email</span>
</div>
```

#### **4. Form States**
```typescript
// Form states
loginForm.valid      // All fields valid?
loginForm.invalid    // Any field invalid?
loginForm.pristine   // Not modified?
loginForm.dirty      // Modified?
loginForm.touched    // User interacted?
loginForm.untouched  // Not interacted?
```

### ✅ Advantages:
- Quick to setup
- Less code
- Easy to understand
- Good for simple forms

### ❌ Disadvantages:
- Hard to test
- Logic in template
- Limited control
- Hard to create dynamic forms

---

## 2️⃣ Reactive Forms (Advanced Approach)

### 📍 What is it?

Form logic **component (TypeScript)** mein hoti hai. Aap manually form model create karte hain.

### 🔧 Setup

```typescript
// Component
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  // ...
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
      // { username: 'ali', password: '123456' }
    }
  }
  
  // Getters for easy access
  get username() {
    return this.loginForm.get('username');
  }
  
  get password() {
    return this.loginForm.get('password');
  }
}
```

```html
<!-- Template -->
<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
  <input formControlName="username">
  <div *ngIf="username?.invalid && username?.touched">
    <span *ngIf="username?.errors?.['required']">Username required</span>
    <span *ngIf="username?.errors?.['minlength']">Min 3 characters</span>
  </div>
  
  <input formControlName="password" type="password">
  <div *ngIf="password?.invalid && password?.touched">
    <span *ngIf="password?.errors?.['required']">Password required</span>
    <span *ngIf="password?.errors?.['minlength']">Min 6 characters</span>
  </div>
  
  <button [disabled]="loginForm.invalid">Login</button>
</form>
```

### 📝 Key Features:

#### **1. FormBuilder**
```typescript
// Easy way to create forms
this.loginForm = this.fb.group({
  username: [''],           // Default value
  email: ['', Validators.required],  // With validator
  age: [0, [Validators.min(18), Validators.max(100)]]  // Multiple validators
});
```

#### **2. FormControl**
```typescript
// Individual form control
import { FormControl } from '@angular/forms';

username = new FormControl('', Validators.required);

// Access value
console.log(this.username.value);

// Set value
this.username.setValue('Ali');

// Check validity
console.log(this.username.valid);
```

#### **3. FormGroup**
```typescript
// Group of controls
import { FormGroup, FormControl } from '@angular/forms';

loginForm = new FormGroup({
  username: new FormControl(''),
  password: new FormControl('')
});

// Access nested values
console.log(this.loginForm.value);
// { username: 'ali', password: '123' }

// Access specific control
this.loginForm.get('username')?.setValue('Ahmed');
```

#### **4. Built-in Validators**
```typescript
import { Validators } from '@angular/forms';

this.fb.group({
  username: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(20)
  ]],
  email: ['', [
    Validators.required,
    Validators.email
  ]],
  age: ['', [
    Validators.required,
    Validators.min(18),
    Validators.max(100)
  ]],
  phone: ['', [
    Validators.required,
    Validators.pattern(/^[0-9]{11}$/)
  ]]
});
```

#### **5. Custom Validators**
```typescript
// Custom validator function
function passwordStrength(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  
  if (!value) {
    return null;
  }
  
  const hasNumber = /[0-9]/.test(value);
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasSpecial = /[!@#$%^&*]/.test(value);
  
  const valid = hasNumber && hasUpper && hasLower && hasSpecial;
  
  return valid ? null : { passwordStrength: true };
}

// Use in form
this.fb.group({
  password: ['', [Validators.required, passwordStrength]]
});
```

#### **6. Async Validators**
```typescript
// Check if username exists (API call)
function usernameExists(http: HttpClient): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return http.get(`/api/check-username/${control.value}`).pipe(
      map((exists: boolean) => exists ? { usernameExists: true } : null),
      catchError(() => of(null))
    );
  };
}

// Use in form
this.fb.group({
  username: ['', 
    [Validators.required],  // Sync validators
    [usernameExists(this.http)]  // Async validators
  ]
});
```

#### **7. Dynamic Forms**
```typescript
// Add controls dynamically
addPhone() {
  const phoneControl = new FormControl('', Validators.required);
  this.loginForm.addControl('phone', phoneControl);
}

// Remove controls
removePhone() {
  this.loginForm.removeControl('phone');
}

// FormArray for multiple items
import { FormArray } from '@angular/forms';

this.fb.group({
  name: [''],
  phones: this.fb.array([
    this.fb.control(''),
    this.fb.control('')
  ])
});

// Add to array
get phones() {
  return this.loginForm.get('phones') as FormArray;
}

addPhoneField() {
  this.phones.push(this.fb.control(''));
}

removePhoneField(index: number) {
  this.phones.removeAt(index);
}
```

### ✅ Advantages:
- Full control
- Easy to test
- Logic in component
- Dynamic forms easy
- Complex validation
- Better for large forms

### ❌ Disadvantages:
- More code
- Steeper learning curve
- More setup required

---

## 🔄 Converting Template-Driven to Reactive

### Example: Student Form

#### **Before (Template-Driven):**

```typescript
// Component
export class Students {
  newStudent = {
    name: '',
    fatherName: '',
    class: '',
    rollNumber: '',
    phone: '',
    address: ''
  };
  
  addStudent() {
    if (!this.newStudent.name || !this.newStudent.class) {
      alert('Please fill required fields');
      return;
    }
    // Save student
  }
}
```

```html
<!-- Template -->
<form #studentForm="ngForm" (ngSubmit)="addStudent()">
  <input [(ngModel)]="newStudent.name" name="name" required>
  <input [(ngModel)]="newStudent.fatherName" name="fatherName">
  <input [(ngModel)]="newStudent.class" name="class" required>
  <input [(ngModel)]="newStudent.rollNumber" name="rollNumber" required>
  <input [(ngModel)]="newStudent.phone" name="phone">
  <input [(ngModel)]="newStudent.address" name="address">
  
  <button [disabled]="!studentForm.valid">Add Student</button>
</form>
```

#### **After (Reactive):**

```typescript
// Component
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class Students {
  studentForm!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.initForm();
  }
  
  initForm() {
    this.studentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      fatherName: ['', Validators.required],
      class: ['', Validators.required],
      rollNumber: ['', [Validators.required, Validators.pattern(/^R-\d{3}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^03\d{9}$/)]],
      address: ['', Validators.maxLength(200)]
    });
  }
  
  addStudent() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }
    
    const studentData = this.studentForm.value;
    // Save student
    
    // Reset form
    this.studentForm.reset();
  }
  
  // Getters for easy access
  get name() { return this.studentForm.get('name'); }
  get fatherName() { return this.studentForm.get('fatherName'); }
  get studentClass() { return this.studentForm.get('class'); }
  get rollNumber() { return this.studentForm.get('rollNumber'); }
  get phone() { return this.studentForm.get('phone'); }
  get address() { return this.studentForm.get('address'); }
}
```

```html
<!-- Template -->
<form [formGroup]="studentForm" (ngSubmit)="addStudent()">
  <div>
    <input formControlName="name" placeholder="Student Name">
    <div *ngIf="name?.invalid && name?.touched" class="error">
      <span *ngIf="name?.errors?.['required']">Name is required</span>
      <span *ngIf="name?.errors?.['minlength']">Min 3 characters</span>
    </div>
  </div>
  
  <div>
    <input formControlName="fatherName" placeholder="Father Name">
    <div *ngIf="fatherName?.invalid && fatherName?.touched" class="error">
      <span *ngIf="fatherName?.errors?.['required']">Father name required</span>
    </div>
  </div>
  
  <div>
    <input formControlName="class" placeholder="Class">
    <div *ngIf="studentClass?.invalid && studentClass?.touched" class="error">
      <span *ngIf="studentClass?.errors?.['required']">Class is required</span>
    </div>
  </div>
  
  <div>
    <input formControlName="rollNumber" placeholder="Roll Number (R-001)">
    <div *ngIf="rollNumber?.invalid && rollNumber?.touched" class="error">
      <span *ngIf="rollNumber?.errors?.['required']">Roll number required</span>
      <span *ngIf="rollNumber?.errors?.['pattern']">Format: R-001</span>
    </div>
  </div>
  
  <div>
    <input formControlName="phone" placeholder="Phone (03001234567)">
    <div *ngIf="phone?.invalid && phone?.touched" class="error">
      <span *ngIf="phone?.errors?.['required']">Phone is required</span>
      <span *ngIf="phone?.errors?.['pattern']">Invalid phone format</span>
    </div>
  </div>
  
  <div>
    <textarea formControlName="address" placeholder="Address"></textarea>
    <div *ngIf="address?.invalid && address?.touched" class="error">
      <span *ngIf="address?.errors?.['maxlength']">Max 200 characters</span>
    </div>
  </div>
  
  <button [disabled]="studentForm.invalid">Add Student</button>
</form>
```

---

## 🎯 When to Use Which?

### Use Template-Driven When:
- ✅ Simple forms (login, search)
- ✅ Few fields (< 5)
- ✅ Basic validation
- ✅ Quick prototyping
- ✅ Learning Angular

### Use Reactive When:
- ✅ Complex forms (registration, profile)
- ✅ Many fields (> 5)
- ✅ Complex validation
- ✅ Dynamic forms
- ✅ Need testing
- ✅ Production apps

---

## 🎓 Key Concepts Learned

1. ✅ **Template-Driven Forms** - Simple, template-based
2. ✅ **Reactive Forms** - Powerful, component-based
3. ✅ **FormBuilder** - Easy form creation
4. ✅ **FormControl** - Individual field
5. ✅ **FormGroup** - Group of fields
6. ✅ **FormArray** - Dynamic fields
7. ✅ **Validators** - Built-in & custom
8. ✅ **Async Validators** - API-based validation

---

## 📝 Practice Exercise

Convert your Login component to Reactive Forms:

```typescript
// TODO: Convert this to Reactive Forms
export class LoginComponent {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  onSubmit() {
    // Login logic
  }
}
```

**Requirements:**
1. Use FormBuilder
2. Add validators (required, minLength)
3. Add custom validator for password strength
4. Show error messages
5. Disable button when invalid

---

**Next Tutorial:** Routing System Deep Dive 🚀
