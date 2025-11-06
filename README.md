# User Hub - User Management System

Angular-based user management application with role-based access control (RBAC).

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start JSON Server (API)
npm run api

# Start Angular app (in new terminal)
ng serve
```

Open browser: `http://localhost:4200`

---

## 🔑 Test Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@userhub.com | admin123 | Full access |
| **Manager** | manager@userhub.com | manager123 | CRUD operations |
| **User** | user@userhub.com | user123 | Create, Read, Update |
| **Guest** | guest@userhub.com | guest123 | Dashboard only |

---

## ✨ Features

- **Authentication** - Login/Logout with role-based access
- **User Management** - CRUD operations for user profiles
- **Role-Based Access Control** - 4 roles (Admin, Manager, User, Guest)
- **Search & Filter** - Real-time search with autocomplete
- **Data Visualization** - Charts for monthly turnover
- **Responsive Design** - Works on all devices

---

## 🛠️ Tech Stack

- **Angular 19** - Frontend framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Chart.js** - Data visualization
- **JSON Server** - Mock REST API
- **Bootstrap Icons** - UI icons

---

## 📁 Project Structure

```
src/app/
├── guards/          # Route protection (auth, role)
├── interceptors/    # HTTP interceptors (auth, error, loading)
├── services/        # Business logic (auth, user)
├── login/           # Login component
├── dashboard/       # Dashboard component
└── users/           # User management component
```




## 📦 API Endpoints

JSON Server runs on `http://localhost:3000`

- `GET /users` - Get all users
- `GET /profiles` - Get all profiles
- `POST /profiles` - Create profile
- `PUT /profiles/:id` - Update profile
- `DELETE /profiles/:id` - Delete profile

---

