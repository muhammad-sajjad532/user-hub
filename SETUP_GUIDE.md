# School Management System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation Steps

1. **Install Dependencies**
   ```bash
   cd user_hub
   npm install
   ```

2. **Start JSON Server (Backend)**
   
   Open a **new terminal** and run:
   ```bash
   npm run json-server
   ```
   
   Or manually:
   ```bash
   json-server --watch db.json --port 3000
   ```
   
   **Important:** JSON Server must be running on port 3000 for data persistence!

3. **Start Angular App (Frontend)**
   
   Open **another terminal** and run:
   ```bash
   npm start
   ```
   
   Or:
   ```bash
   ng serve
   ```

4. **Access the Application**
   
   Open your browser and go to:
   ```
   http://localhost:4200
   ```

## 🔐 Default Login Credentials

```
Email: admin@userhub.com
Password: admin123
Role: admin
```

## 📊 Data Persistence

### How It Works

The application now uses **JSON Server** as a backend to store data permanently in `db.json`.

**Students Data:**
- **Add Student** → Saved to `db.json` → Persists after refresh ✅
- **Edit Student** → Updated in `db.json` → Changes saved permanently ✅
- **Delete Student** → Removed from `db.json` → Deletion is permanent ✅

### API Endpoints

JSON Server provides REST API endpoints:

```
GET    http://localhost:3000/students      - Get all students
POST   http://localhost:3000/students      - Add new student
PUT    http://localhost:3000/students/:id  - Update student
DELETE http://localhost:3000/students/:id  - Delete student
```

### Database File

All data is stored in:
```
user_hub/db.json
```

**Structure:**
```json
{
  "students": [
    {
      "id": 1,
      "name": "Ahmed Ali",
      "fatherName": "Ali Khan",
      "class": "10-A",
      "rollNumber": "101",
      "phone": "0300-1234567",
      "address": "Karachi",
      "admissionDate": "2024-01-15",
      "feeStatus": "paid"
    }
  ],
  "users": [...],
  "profiles": [...]
}
```

## 🧪 Testing Data Persistence

### Test Add Student:
1. Login as admin
2. Go to Students page
3. Click "Add New Student"
4. Fill the form and save
5. **Refresh the page** → Student still there! ✅

### Test Edit Student:
1. Click Edit icon (blue)
2. Modify information
3. Click "Update Student"
4. **Refresh the page** → Changes saved! ✅

### Test Delete Student:
1. Click Delete icon (red)
2. Confirm deletion
3. **Refresh the page** → Student removed! ✅

## ⚠️ Troubleshooting

### Problem: "Failed to load students"

**Solution:**
- Make sure JSON Server is running on port 3000
- Check if `db.json` exists in the project root
- Verify the API URL in console

**Start JSON Server:**
```bash
json-server --watch db.json --port 3000
```

### Problem: Port 3000 already in use

**Solution:**
```bash
# Find and kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port:
json-server --watch db.json --port 3001
```

Then update API URL in `students.ts`:
```typescript
private apiUrl = 'http://localhost:3001/students';
```

### Problem: Port 4200 already in use

**Solution:**
```bash
ng serve --port 4201
```

### Problem: Changes not saving

**Check:**
1. Is JSON Server running? ✅
2. Check browser console for errors
3. Verify `db.json` has write permissions
4. Check network tab in DevTools

## 📝 Development Notes

### Adding New Modules

To add Teachers, Classes, Attendance, or Fees modules:

1. **Add to db.json:**
```json
{
  "students": [...],
  "teachers": [],
  "classes": [],
  "attendance": [],
  "fees": []
}
```

2. **Create Component:**
```bash
ng generate component components/teachers/teachers
```

3. **Use HttpClient:**
```typescript
private apiUrl = 'http://localhost:3000/teachers';

loadTeachers() {
  this.http.get<Teacher[]>(this.apiUrl).subscribe(...)
}
```

### Backup Data

**Backup db.json regularly:**
```bash
copy db.json db.backup.json
```

### Reset Data

**Restore original data:**
```bash
copy db.backup.json db.json
```

## 🎯 Features Implemented

✅ **Permanent Data Storage** - All CRUD operations save to JSON Server  
✅ **Success Modals** - Beautiful animated success messages  
✅ **Delete Confirmation** - Warning modal before deletion  
✅ **Error Handling** - User-friendly error messages  
✅ **Auto-refresh** - Data loads from server on page load  
✅ **Role-based Access** - Permissions enforced  
✅ **Notifications** - Real-time notification system  

## 📚 Next Steps

1. ✅ Students module with permanent storage
2. [ ] Teachers module
3. [ ] Classes module
4. [ ] Attendance tracking
5. [ ] Fee management
6. [ ] Reports and analytics
7. [ ] Export to Excel/PDF
8. [ ] Email notifications

---

**Need Help?**
- Check console for errors (F12)
- Verify JSON Server is running
- Check network tab in DevTools
- Review error messages in alerts

**Happy Coding! 🎓✨**
