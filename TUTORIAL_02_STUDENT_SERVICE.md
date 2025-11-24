# 📚 Tutorial 02: Student Service - CRUD Operations

## 📍 File Location: `src/app/services/student.service.ts`

Ye service **students ka data manage** karti hai - Create, Read, Update, Delete (CRUD) operations.

---

## 🔍 Complete Code with Line-by-Line Explanation

```typescript
// Line 1-3: Required imports
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
```

### 📝 Explanation:

**`Injectable`**: Service decorator
**`HttpClient`**: HTTP requests ke liye (GET, POST, PUT, DELETE)
**`Observable`**: Asynchronous data stream (RxJS library se)

### 💡 Observable kya hai?

Observable ek **data stream** hai jo time ke sath values emit karta hai.

**Real-life analogy:** YouTube subscription
- Aap channel subscribe karte ho (Observable)
- Jab naya video aata hai, aapko notification milta hai (emit)
- Aap video dekh sakte ho (consume)

```typescript
// Observable example
const numbers$ = new Observable(observer => {
  observer.next(1);  // Emit 1
  observer.next(2);  // Emit 2
  observer.next(3);  // Emit 3
  observer.complete(); // Done
});

// Subscribe to receive values
numbers$.subscribe({
  next: (value) => console.log(value),  // 1, 2, 3
  complete: () => console.log('Done!')
});
```

---

```typescript
// Line 5-14: Student interface
export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  class: string;
  rollNumber: string;
  address: string;
  dateOfBirth: string;
  status: 'active' | 'inactive';
}
```

### 📝 Explanation:

**Interface**: Data structure ka blueprint

**Properties:**
- `id: number` - Unique identifier (1, 2, 3...)
- `name: string` - Student ka naam
- `email: string` - Email address
- `phone: string` - Phone number
- `class: string` - Class (e.g., "10th", "9th")
- `rollNumber: string` - Roll number
- `address: string` - Address
- `dateOfBirth: string` - DOB (ISO format: "2005-01-15")
- `status: 'active' | 'inactive'` - Union type (sirf 2 values)

### 🎯 Why Interface?

```typescript
// ✅ With Interface - Type safety
const student: Student = {
  id: 1,
  name: 'Ali',
  email: 'ali@example.com',
  // ... TypeScript error agar koi property missing ho
};

// ❌ Without Interface - No type checking
const student = {
  id: 1,
  nam: 'Ali',  // Typo! But no error
  // Missing properties - No error
};
```

---

```typescript
// Line 16-18: Service decorator
@Injectable({
  providedIn: 'root'
})
```

### 📝 Explanation:

**`providedIn: 'root'`**: 
- Service ko application-wide available banata hai
- Singleton pattern - ek hi instance
- Lazy loading support

**Alternative approaches:**

```typescript
// Approach 1: Root level (Current)
@Injectable({ providedIn: 'root' })

// Approach 2: Module level
@Injectable()
// Then add to providers array in module

// Approach 3: Component level
@Injectable()
// Then add to component's providers array
```

---

```typescript
// Line 19-20: API URL
export class StudentService {
  private apiUrl = 'http://localhost:3000/students';
```

### 📝 Explanation:

**`private apiUrl`**: 
- API endpoint ka base URL
- `private` = sirf is class ke andar accessible
- JSON Server port 3000 pe run ho raha hai

### 🌐 REST API Endpoints:

```
GET    http://localhost:3000/students       → Get all students
GET    http://localhost:3000/students/1     → Get student with id=1
POST   http://localhost:3000/students       → Create new student
PUT    http://localhost:3000/students/1     → Update student with id=1
DELETE http://localhost:3000/students/1     → Delete student with id=1
```

---

```typescript
// Line 22-23: Constructor with Dependency Injection
constructor(private http: HttpClient) {}
```

### 📝 Explanation:

**Dependency Injection in action:**

```typescript
// Angular automatically ye karta hai:
const httpClient = new HttpClient();
const studentService = new StudentService(httpClient);
```

**Benefits:**
1. ✅ Loose coupling
2. ✅ Easy testing (mock HttpClient)
3. ✅ Code reusability
4. ✅ Automatic instance management

---

```typescript
// Line 25-27: Get all students
getAll(): Observable<Student[]> {
  return this.http.get<Student[]>(this.apiUrl);
}
```

### 📝 Explanation:

**Method signature:**
- `getAll()`: Method name
- `: Observable<Student[]>`: Return type
  - Observable of Student array
  - Asynchronous operation

**`this.http.get<Student[]>()`:**
- `get`: HTTP GET request
- `<Student[]>`: Generic type - response ka type
- `this.apiUrl`: Request URL

### 🎯 How it works:

```typescript
// 1. Component calls service
studentService.getAll().subscribe({
  next: (students) => {
    // students is Student[] type
    console.log(students);
  },
  error: (error) => {
    console.error('Error:', error);
  }
});

// 2. HTTP Request
GET http://localhost:3000/students

// 3. Response from server
[
  { id: 1, name: 'Ali', email: 'ali@example.com', ... },
  { id: 2, name: 'Sara', email: 'sara@example.com', ... }
]

// 4. Observable emits data
// 5. Component receives data in subscribe
```

### 💡 Observable vs Promise:

```typescript
// Promise (single value)
fetch('/api/students')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

// Observable (stream of values)
http.get('/api/students')
  .subscribe({
    next: (data) => console.log(data),
    error: (error) => console.error(error),
    complete: () => console.log('Done')
  });
```

**Observable advantages:**
- ✅ Cancellable (unsubscribe)
- ✅ Multiple values over time
- ✅ Operators (map, filter, etc.)
- ✅ Retry logic

---

```typescript
// Line 29-31: Get student by ID
getById(id: number): Observable<Student> {
  return this.http.get<Student>(`${this.apiUrl}/${id}`);
}
```

### 📝 Explanation:

**Template literal:**
- `` `${this.apiUrl}/${id}` ``
- String interpolation
- Dynamic URL generation

**Example:**
```typescript
const id = 5;
const url = `${this.apiUrl}/${id}`;
// Result: "http://localhost:3000/students/5"
```

**Traditional way:**
```typescript
const url = this.apiUrl + '/' + id;
```

### 🎯 Usage:

```typescript
// Get student with id = 3
studentService.getById(3).subscribe({
  next: (student) => {
    console.log(student.name);  // Single student object
  }
});

// HTTP Request:
GET http://localhost:3000/students/3

// Response:
{ id: 3, name: 'Ahmed', email: 'ahmed@example.com', ... }
```

---

```typescript
// Line 33-35: Create new student
create(student: Omit<Student, 'id'>): Observable<Student> {
  return this.http.post<Student>(this.apiUrl, student);
}
```

### 📝 Explanation:

**`Omit<Student, 'id'>`**: TypeScript utility type
- Student interface se 'id' property remove kar do
- Kyunki new student create karte waqt id nahi hoti
- Server automatically id generate karta hai

**Example:**
```typescript
// Student interface
interface Student {
  id: number;
  name: string;
  email: string;
}

// Omit<Student, 'id'> results in:
{
  name: string;
  email: string;
  // id property removed
}
```

**`this.http.post()`:**
- First parameter: URL
- Second parameter: Request body (data)

### 🎯 Usage:

```typescript
// New student data (without id)
const newStudent = {
  name: 'Fatima',
  email: 'fatima@example.com',
  phone: '03001234567',
  class: '10th',
  rollNumber: 'R-101',
  address: 'Karachi',
  dateOfBirth: '2005-03-15',
  status: 'active'
};

// Create student
studentService.create(newStudent).subscribe({
  next: (createdStudent) => {
    console.log('Created:', createdStudent);
    // createdStudent will have id assigned by server
  }
});

// HTTP Request:
POST http://localhost:3000/students
Body: { name: 'Fatima', email: '...', ... }

// Response:
{ id: 10, name: 'Fatima', email: '...', ... }
```

### 💡 Other TypeScript Utility Types:

```typescript
// Pick - Select specific properties
type StudentBasic = Pick<Student, 'id' | 'name' | 'email'>;
// Result: { id: number; name: string; email: string; }

// Partial - Make all properties optional
type StudentUpdate = Partial<Student>;
// Result: { id?: number; name?: string; ... }

// Required - Make all properties required
type StudentRequired = Required<Student>;

// Readonly - Make all properties readonly
type StudentReadonly = Readonly<Student>;
```

---

```typescript
// Line 37-39: Update student
update(id: number, student: Student): Observable<Student> {
  return this.http.put<Student>(`${this.apiUrl}/${id}`, student);
}
```

### 📝 Explanation:

**`http.put()`**: HTTP PUT request
- Complete replacement of resource
- All fields must be provided

**Parameters:**
1. `id: number` - Which student to update
2. `student: Student` - Complete student object with all fields

### 🎯 Usage:

```typescript
// Updated student data
const updatedStudent: Student = {
  id: 5,
  name: 'Ali Khan',  // Updated name
  email: 'ali.khan@example.com',  // Updated email
  phone: '03001234567',
  class: '11th',  // Updated class
  rollNumber: 'R-105',
  address: 'Lahore',
  dateOfBirth: '2004-05-20',
  status: 'active'
};

// Update student
studentService.update(5, updatedStudent).subscribe({
  next: (student) => {
    console.log('Updated:', student);
  }
});

// HTTP Request:
PUT http://localhost:3000/students/5
Body: { id: 5, name: 'Ali Khan', ... }

// Response:
{ id: 5, name: 'Ali Khan', ... }
```

### 💡 PUT vs PATCH:

```typescript
// PUT - Complete replacement
http.put('/students/5', completeStudentObject);
// Must send ALL fields

// PATCH - Partial update
http.patch('/students/5', { name: 'New Name' });
// Send only changed fields
```

---

```typescript
// Line 41-43: Delete student
delete(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/${id}`);
}
```

### 📝 Explanation:

**`Observable<void>`**: 
- `void` = no return value
- Delete operation usually doesn't return data
- Just confirms success/failure

### 🎯 Usage:

```typescript
// Delete student with id = 7
studentService.delete(7).subscribe({
  next: () => {
    console.log('Student deleted successfully');
  },
  error: (error) => {
    console.error('Delete failed:', error);
  }
});

// HTTP Request:
DELETE http://localhost:3000/students/7

// Response:
{} // Empty object or status code 200/204
```

---

## 🎯 Complete CRUD Flow Example

### Scenario: Student management lifecycle

```typescript
// 1. GET ALL - Load students list
studentService.getAll().subscribe({
  next: (students) => {
    console.log('All students:', students);
    // Display in table
  }
});

// 2. GET BY ID - View student details
studentService.getById(3).subscribe({
  next: (student) => {
    console.log('Student details:', student);
    // Show in modal/detail page
  }
});

// 3. CREATE - Add new student
const newStudent = {
  name: 'Hassan',
  email: 'hassan@example.com',
  phone: '03001234567',
  class: '9th',
  rollNumber: 'R-201',
  address: 'Islamabad',
  dateOfBirth: '2006-08-10',
  status: 'active'
};

studentService.create(newStudent).subscribe({
  next: (created) => {
    console.log('New student created:', created);
    // Refresh list
    // Show success message
  }
});

// 4. UPDATE - Edit student
const updated = {
  id: 3,
  name: 'Hassan Ali',  // Changed
  email: 'hassan@example.com',
  phone: '03009876543',  // Changed
  class: '10th',  // Changed
  rollNumber: 'R-201',
  address: 'Islamabad',
  dateOfBirth: '2006-08-10',
  status: 'active'
};

studentService.update(3, updated).subscribe({
  next: (student) => {
    console.log('Student updated:', student);
    // Refresh list
    // Show success message
  }
});

// 5. DELETE - Remove student
studentService.delete(3).subscribe({
  next: () => {
    console.log('Student deleted');
    // Remove from list
    // Show success message
  }
});
```

---

## 🔄 Observable Operators (Advanced)

Service mein operators use kar sakte hain:

```typescript
import { map, catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Example: Transform response
getAll(): Observable<Student[]> {
  return this.http.get<Student[]>(this.apiUrl).pipe(
    map(students => students.filter(s => s.status === 'active')),
    retry(3),  // Retry 3 times on failure
    catchError(error => {
      console.error('Error:', error);
      return throwError(() => new Error('Failed to load students'));
    })
  );
}
```

**Common operators:**
- `map`: Transform data
- `filter`: Filter data
- `catchError`: Handle errors
- `retry`: Retry on failure
- `debounceTime`: Delay execution
- `switchMap`: Switch to new observable

---

## 🎓 Key Concepts Learned

1. ✅ **HttpClient** - HTTP requests
2. ✅ **Observable** - Asynchronous data streams
3. ✅ **Generic Types** - `<Student[]>`, `<Student>`
4. ✅ **Template Literals** - `` `${url}/${id}` ``
5. ✅ **Utility Types** - `Omit<Student, 'id'>`
6. ✅ **REST API** - GET, POST, PUT, DELETE
7. ✅ **CRUD Operations** - Create, Read, Update, Delete
8. ✅ **Type Safety** - Interface usage

---

## 📝 Practice Exercise

Add these methods to StudentService:

```typescript
// 1. Search students by name
searchByName(name: string): Observable<Student[]> {
  return this.http.get<Student[]>(`${this.apiUrl}?name_like=${name}`);
}

// 2. Get students by class
getByClass(className: string): Observable<Student[]> {
  return this.http.get<Student[]>(`${this.apiUrl}?class=${className}`);
}

// 3. Get active students only
getActiveStudents(): Observable<Student[]> {
  return this.http.get<Student[]>(`${this.apiUrl}?status=active`);
}

// 4. Update student status
updateStatus(id: number, status: 'active' | 'inactive'): Observable<Student> {
  return this.http.patch<Student>(`${this.apiUrl}/${id}`, { status });
}
```

---

**Next Tutorial:** Student Component - UI Logic 🚀
