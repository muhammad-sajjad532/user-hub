# 🎓 School Management System

A comprehensive web-based School Management System built with Angular 19 and JSON Server for managing students, teachers, attendance, fees, and more.

## 📋 Features

### Core Modules
- **Dashboard** - Overview of school statistics and quick actions
- **Student Management** - Register, view, and manage student records
- **Teacher Management** - Manage teacher profiles and assignments
- **Class Management** - Organize classes and subjects
- **Attendance Tracking** - Daily attendance marking and reports
- **Fee Management** - Track fee payments and pending dues
- **Settings** - User profile and system preferences

### Additional Features
- 🔐 **Authentication** - Secure login/signup system
- 🔔 **Notifications** - Real-time school announcements and alerts
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📊 **Statistics** - Visual representation of school data
- 👤 **User Roles** - Admin, Teacher, and Staff access levels
- 💾 **Data Persistence** - JSON Server backend for data storage

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user_hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start JSON Server (Backend)**
   ```bash
   npm run json-server
   ```
   This will start the backend server on `http://localhost:3000`

4. **Start Angular Development Server**
   ```bash
   npm start
   ```
   or
   ```bash
   ng serve
   ```
   The app will be available at `http://localhost:4200`

## 📊 Dashboard Statistics

The dashboard displays:
- **Total Students** - Current enrolled students count
- **Total Teachers** - Active teaching staff
- **Today's Attendance** - Real-time attendance percentage
- **Pending Fees** - Outstanding fee amounts and student count

## 🎯 Quick Actions

- Add new student
- Register teacher
- Mark attendance
- Collect fee payment

## 🔔 Notification System

Real-time notifications for:
- New student admissions
- Parent-teacher meetings
- Fee payments
- Attendance alerts
- Exam schedules

## 🌙 Dark Mode

Toggle between light and dark themes from Settings → Preferences

## 👥 User Roles

- **Admin** - Full system access
- **Teacher** - Student and class management
- **Staff** - Limited access to specific modules

## 🛠️ Technology Stack

- **Frontend**: Angular 19
- **Backend**: JSON Server
- **Styling**: Custom CSS
- **Icons**: Bootstrap Icons
- **Charts**: Chart.js (ng2-charts)

## 📁 Project Structure

```
user_hub/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   └── settings/
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── notification.ts
│   │   │   ├── theme.ts
│   │   │   └── user.ts
│   │   └── interceptors/
│   ├── styles.css
│   └── index.html
├── db.json (JSON Server database)
└── package.json
```

## 🔐 Default Login Credentials

```
Email: admin@school.com
Password: admin123
```

## 📝 API Endpoints

JSON Server provides REST API endpoints:

- `GET /users` - Get all users
- `POST /users` - Create new user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🎨 Customization

### Change School Name
Update the logo text in:
- `dashboard.html`
- `settings.html`
- `login.html`
- `signup.html`

### Modify Statistics
Edit the `loadStatistics()` method in `dashboard.ts`

### Add New Notifications
Use the `NotificationService.addNotification()` method

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change port in package.json or use:
ng serve --port 4201
```

**JSON Server not starting:**
```bash
# Install json-server globally
npm install -g json-server
json-server --watch db.json --port 3000
```

## 📄 License

This project is open source and available for educational purposes.

## 👨‍💻 Developer

Built with ❤️ for school management needs

---

**Note**: This is a demo application. For production use, implement proper backend with database, security measures, and data validation.
