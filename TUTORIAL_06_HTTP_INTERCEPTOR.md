# ⚡ Tutorial 06: HTTP Interceptor - Loading State & Middleware

## 📍 File Location: `src/app/interceptors/loading-interceptor.ts`

Interceptor ek **middleware** hai jo har HTTP request/response ko intercept karta hai.

---

## 🎯 What is an Interceptor?

**Real-life analogy:** Airport security checkpoint
- Har passenger (request) ko check karta hai
- Boarding pass (headers) verify karta hai
- Baggage (data) scan karta hai
- Sab kuch OK hai to jane deta hai

**HTTP Interceptor:**
- Har HTTP request ko intercept karta hai
- Headers add kar sakta hai
- Loading state manage kar sakta hai
- Errors handle kar sakta hai
- Response transform kar sakta hai

---

## 🔍 Complete Code with Line-by-Line Explanation

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading';
```

### 📝 Imports Explanation:

#### **`HttpInterceptorFn`**
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
```
- Type definition for functional interceptors
- Modern Angular approach (v15+)

**Old vs New:**
```typescript
// ❌ Old way (Class-based)
export class LoadingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // ...
  }
}

// ✅ New way (Functional)
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // ...
};
```

#### **`inject`**
```typescript
import { inject } from '@angular/core';
```
- Functional dependency injection
- Same as guards

#### **`finalize`**
```typescript
import { finalize } from 'rxjs/operators';
```
- RxJS operator
- Executes code when Observable completes
- Runs on both success AND error

**Example:**
```typescript
http.get('/api/data').pipe(
  finalize(() => {
    console.log('Request completed!');
    // This runs whether success or error
  })
).subscribe({
  next: (data) => console.log('Success:', data),
  error: (error) => console.error('Error:', error)
});
```

---

## ⚡ Interceptor Function

```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Show loading spinner
  loadingService.show();

  // Pass request and hide spinner when done
  return next(req).pipe(
    finalize(() => {
      // This runs whether request succeeds or fails
      loadingService.hide();
    })
  );
};
```

### 📝 Line-by-Line Breakdown:

#### **Line 1: Function signature**
```typescript
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
```

**Parameters:**
- `req`: HTTP request object
- `next`: Function to pass request to next interceptor/backend

**Type signature:**
```typescript
type HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => Observable<HttpEvent<unknown>>;
```

#### **Line 2: Inject service**
```typescript
const loadingService = inject(LoadingService);
```
- Get LoadingService instance
- Will manage loading state

#### **Line 4-5: Show loading**
```typescript
loadingService.show();
```
- Increment loading counter
- Show spinner if counter > 0

**LoadingService implementation:**
```typescript
export class LoadingService {
  private loadingCount = 0;
  private loading$ = new BehaviorSubject<boolean>(false);
  
  show() {
    this.loadingCount++;
    this.loading$.next(true);
  }
  
  hide() {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this.loading$.next(false);
    }
  }
  
  isLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }
}
```

#### **Line 7-13: Pass request & cleanup**
```typescript
return next(req).pipe(
  finalize(() => {
    loadingService.hide();
  })
);
```

**`next(req)`**: 
- Pass request to next handler
- Returns Observable

**`pipe()`**:
- Chain RxJS operators
- Transform Observable

**`finalize()`**:
- Cleanup function
- Runs when Observable completes
- Runs on success, error, or unsubscribe

---

## 🔄 Interceptor Flow

### Single Request:

```
1. Component makes HTTP request
   http.get('/api/students')
        ↓
2. Interceptor intercepts
   loadingService.show()
   [Loading spinner appears]
        ↓
3. Request sent to server
   GET /api/students
        ↓
4. Server responds
   { data: [...] }
        ↓
5. Response passes through interceptor
   finalize() executes
   loadingService.hide()
   [Loading spinner disappears]
        ↓
6. Component receives data
   subscribe({ next: (data) => ... })
```

### Multiple Concurrent Requests:

```
Request 1: GET /api/students
  ↓ show() → count = 1 → spinner ON
  
Request 2: GET /api/teachers
  ↓ show() → count = 2 → spinner ON
  
Request 3: GET /api/classes
  ↓ show() → count = 3 → spinner ON

Response 1 arrives
  ↓ hide() → count = 2 → spinner ON

Response 2 arrives
  ↓ hide() → count = 1 → spinner ON

Response 3 arrives
  ↓ hide() → count = 0 → spinner OFF
```

**Why counter?**
- Multiple requests can be in progress
- Spinner should stay visible until ALL complete
- Counter tracks active requests

---

## 🎨 Interceptor Registration

### app.config.ts:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './interceptors/loading-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([loadingInterceptor])  // ← Register here
    )
  ]
};
```

### Multiple Interceptors:

```typescript
provideHttpClient(
  withInterceptors([
    loadingInterceptor,    // Runs first
    authInterceptor,       // Runs second
    errorInterceptor,      // Runs third
    loggingInterceptor     // Runs last
  ])
)
```

**Execution order:**
```
Request:  1 → 2 → 3 → 4 → Server
Response: Server → 4 → 3 → 2 → 1
```

---

## 🎯 Common Interceptor Use Cases

### 1. Auth Token Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get token
  const token = authService.getToken();
  
  // Clone request and add Authorization header
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

**Why clone?**
```typescript
// ❌ Request is immutable
req.headers.set('Authorization', token);  // Error!

// ✅ Clone and modify
const cloned = req.clone({
  setHeaders: { Authorization: token }
});
```

**Usage:**
```typescript
// Before interceptor:
GET /api/students
Headers: {}

// After interceptor:
GET /api/students
Headers: {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

### 2. Error Handling Interceptor

```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle different error types
      if (error.status === 401) {
        // Unauthorized - redirect to login
        notificationService.error('Session expired. Please login again.');
      } else if (error.status === 403) {
        // Forbidden
        notificationService.error('You do not have permission.');
      } else if (error.status === 404) {
        // Not found
        notificationService.error('Resource not found.');
      } else if (error.status === 500) {
        // Server error
        notificationService.error('Server error. Please try again later.');
      } else {
        // Other errors
        notificationService.error('An error occurred.');
      }
      
      // Re-throw error
      return throwError(() => error);
    })
  );
};
```

**HTTP Status Codes:**
```
2xx - Success
  200 OK
  201 Created
  204 No Content

4xx - Client Errors
  400 Bad Request
  401 Unauthorized (not logged in)
  403 Forbidden (no permission)
  404 Not Found

5xx - Server Errors
  500 Internal Server Error
  502 Bad Gateway
  503 Service Unavailable
```

---

### 3. Logging Interceptor

```typescript
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();
  
  console.log('🚀 Request:', req.method, req.url);
  
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          const duration = Date.now() - startTime;
          console.log('✅ Response:', req.url, `(${duration}ms)`);
        }
      },
      error: (error) => {
        const duration = Date.now() - startTime;
        console.error('❌ Error:', req.url, `(${duration}ms)`, error);
      }
    })
  );
};
```

**Console output:**
```
🚀 Request: GET /api/students
✅ Response: /api/students (234ms)

🚀 Request: POST /api/students
❌ Error: /api/students (156ms) HttpErrorResponse {...}
```

---

### 4. Caching Interceptor

```typescript
export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(CacheService);
  
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next(req);
  }
  
  // Check cache
  const cachedResponse = cacheService.get(req.url);
  if (cachedResponse) {
    console.log('📦 Returning cached response:', req.url);
    return of(cachedResponse);
  }
  
  // Not in cache, make request
  return next(req).pipe(
    tap(response => {
      if (response.type === HttpEventType.Response) {
        cacheService.set(req.url, response);
      }
    })
  );
};
```

---

### 5. Retry Interceptor

```typescript
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: 3,  // Retry 3 times
      delay: 1000,  // Wait 1 second between retries
      resetOnSuccess: true
    }),
    catchError(error => {
      console.error('Failed after 3 retries:', error);
      return throwError(() => error);
    })
  );
};
```

**Retry flow:**
```
Attempt 1: Request → Error
           ↓ Wait 1s
Attempt 2: Request → Error
           ↓ Wait 1s
Attempt 3: Request → Error
           ↓ Wait 1s
Attempt 4: Request → Error
           ↓
Give up, throw error
```

---

### 6. Request Timeout Interceptor

```typescript
export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const TIMEOUT = 30000;  // 30 seconds
  
  return next(req).pipe(
    timeout(TIMEOUT),
    catchError(error => {
      if (error.name === 'TimeoutError') {
        console.error('Request timeout:', req.url);
        return throwError(() => new Error('Request timeout'));
      }
      return throwError(() => error);
    })
  );
};
```

---

## 🎨 Advanced Patterns

### Conditional Interceptor:

```typescript
export const conditionalInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip interceptor for specific URLs
  if (req.url.includes('/public/')) {
    return next(req);
  }
  
  // Apply interceptor logic
  // ...
};
```

### Request Modification:

```typescript
export const modifyRequestInterceptor: HttpInterceptorFn = (req, next) => {
  // Add custom headers
  const modified = req.clone({
    setHeaders: {
      'X-Custom-Header': 'value',
      'X-Request-ID': generateRequestId()
    },
    setParams: {
      'api_key': 'your-api-key'
    }
  });
  
  return next(modified);
};
```

### Response Transformation:

```typescript
export const transformInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event.type === HttpEventType.Response) {
        // Transform response data
        const body = event.body;
        const transformed = {
          ...body,
          timestamp: new Date(),
          source: 'api'
        };
        
        return event.clone({ body: transformed });
      }
      return event;
    })
  );
};
```

---

## 🎓 Key Concepts Learned

1. ✅ **Interceptors** - HTTP middleware
2. ✅ **HttpInterceptorFn** - Functional interceptor type
3. ✅ **finalize** - Cleanup operator
4. ✅ **Request/Response flow** - Interceptor chain
5. ✅ **Loading state** - Multiple requests handling
6. ✅ **Error handling** - catchError operator
7. ✅ **Request cloning** - Immutable requests
8. ✅ **RxJS operators** - tap, map, retry, timeout

---

## 📝 Practice Exercise

Create these interceptors:

### 1. API Base URL Interceptor
```typescript
// Prepend base URL to all requests
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const BASE_URL = 'https://api.example.com';
  
  // If URL doesn't start with http, prepend base URL
  if (!req.url.startsWith('http')) {
    const modified = req.clone({
      url: `${BASE_URL}${req.url}`
    });
    return next(modified);
  }
  
  return next(req);
};

// Usage:
// http.get('/students') → https://api.example.com/students
```

### 2. Request Timestamp Interceptor
```typescript
// Add timestamp to all requests
export const timestampInterceptor: HttpInterceptorFn = (req, next) => {
  // Add timestamp header
  // Log request time
  // Calculate response time
};
```

### 3. Offline Detection Interceptor
```typescript
// Check if user is offline
export const offlineInterceptor: HttpInterceptorFn = (req, next) => {
  if (!navigator.onLine) {
    return throwError(() => new Error('No internet connection'));
  }
  return next(req);
};
```

---

## 🔗 Interceptor + Guard Integration

```typescript
// Auth interceptor adds token
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  return next(req);
};

// Error interceptor handles 401
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired, redirect to login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

// Auth guard protects routes
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  if (authService.isAuthenticated()) {
    return true;
  }
  inject(Router).navigate(['/login']);
  return false;
};
```

**Complete flow:**
```
1. User navigates to /dashboard
2. Auth guard checks authentication
3. If authenticated, allow access
4. Component makes API call
5. Auth interceptor adds token
6. Request sent to server
7. If 401 error, error interceptor redirects to login
```

---

**Next Tutorial:** Routing System & Navigation 🚀
