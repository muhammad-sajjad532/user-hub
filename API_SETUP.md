# 🚀 JSON Server API Setup

## ✅ What We Implemented

Replaced localStorage with a **real REST API** using JSON Server. Now your data persists permanently!

---

## 📦 What is JSON Server?

JSON Server creates a full REST API from a JSON file:
- **GET** `/profiles` - Get all profiles
- **POST** `/profiles` - Add new profile
- **PATCH** `/profiles/:id` - Update profile
- **DELETE** `/profiles/:id` - Delete profile

---

## 🛠️ Installation Complete

### Packages Installed:
```bash
npm install json-server --save-dev
npm install concurrently --save-dev
```

### Files Created:
- `db.json` - Database file (your data lives here!)

### Scripts Added to package.json:
```json
"api": "json-server --watch db.json --port 3000",
"dev": "concurrently \"npm run api\" \"npm start\""
```

---

## 🚀 How to Run

### Option 1: Run Both Servers Together (Recommended)
```bash
npm run dev
```
This starts:
- JSON Server on `http://localhost:3000`
- Angular app on `http://localhost:4200`

### Option 2: Run Separately
**Terminal 1:**
```bash
npm run api
```

**Terminal 2:**
```bash
npm start
```

---

## 📊 API Endpoints

### Base URL: `http://localhost:3000`

### Profiles Endpoints:

#### Get All Profiles
```http
GET /profiles
```
Response:
```json
[
  {
    "id": 1,
    "profileName": "Profile-1",
    "description": "xyz",
    "creationDate": "20-08-2025"
  }
]
```

#### Get Single Profile
```http
GET /profiles/1
```

#### Add New Profile
```http
POST /profiles
Content-Type: application/json

{
  "profileName": "New Profile",
  "description": "Description",
  "creationDate": "01-01-2025"
}
```

#### Update Profile
```http
PATCH /profiles/1
Content-Type: application/json

{
  "profileName": "Updated Name"
}
```

#### Delete Profile
```http
DELETE /profiles/1
```

---

## 🔄 How It Works Now

### Before (localStorage):
```
Component → Service → localStorage
```
- Data lost when browser cleared
- Not shareable between devices
- No real API practice

### After (JSON Server):
```
Component → Service → HTTP → JSON Server → db.json
```
- Data persists permanently
- Shareable (can deploy server)
- Real API experience
- Easy to switch to production API

---

## 📝 Code Changes

### 1. UserService (services/user.ts)

**Before:**
```typescript
addProfile(profile) {
  this.allUsers.push(profile);
  localStorage.setItem('profiles', JSON.stringify(this.allUsers));
}
```

**After:**
```typescript
addProfile(profile): Observable<UserProfile> {
  return this.http.post<UserProfile>(this.API_URL, profile).pipe(
    tap(newProfile => {
      // Update local cache
      this.profilesSubject.next([...profiles, newProfile]);
    })
  );
}
```

### 2. Users Component (users/users/users.ts)

**Before:**
```typescript
this.userService.addProfile(profile);
this.showSuccessMessage('Added!');
```

**After:**
```typescript
this.userService.addProfile(profile).subscribe({
  next: () => this.showSuccessMessage('Added!'),
  error: (error) => alert('Failed!')
});
```

---

## 🎯 Benefits

### 1. **Permanent Storage**
- Data saved to `db.json` file
- Survives server restart
- Survives browser clear
- Can be backed up

### 2. **Real API Experience**
- HTTP requests (GET, POST, PATCH, DELETE)
- Observables and RxJS
- Error handling
- Production-like workflow

### 3. **Easy Testing**
- Can test with Postman
- Can see data in `db.json`
- Can manually edit data
- Can reset data easily

### 4. **Team Collaboration**
- Share `db.json` via Git
- Everyone has same data
- Easy to sync

### 5. **Production Ready**
- Just change API_URL
- Same code works with real backend
- No refactoring needed

---

## 🧪 Testing the API

### Using Browser:
1. Start servers: `npm run dev`
2. Open: `http://localhost:3000/profiles`
3. See JSON response

### Using Postman:
1. Create new request
2. Set URL: `http://localhost:3000/profiles`
3. Set method: GET/POST/PATCH/DELETE
4. Send request

### Using Your App:
1. Go to Users page
2. Add a profile
3. Check `db.json` - it's there!
4. Restart server
5. Profile still there! ✅

---

## 📂 db.json Structure

```json
{
  "profiles": [
    { "id": 1, "profileName": "...", ... }
  ],
  "users": [
    { "id": 1, "email": "...", ... }
  ]
}
```

**You can add more collections:**
```json
{
  "profiles": [...],
  "users": [...],
  "reports": [...],
  "feedback": [...]
}
```

---

## 🔧 Configuration

### Change Port:
```json
"api": "json-server --watch db.json --port 4000"
```

### Change Database File:
```json
"api": "json-server --watch data.json --port 3000"
```

### Enable CORS (if needed):
```json
"api": "json-server --watch db.json --port 3000 --middlewares ./middleware.js"
```

---

## 🚨 Important Notes

### 1. **Start API Server First**
Always run `npm run dev` or `npm run api` before testing

### 2. **Port 3000 Must Be Free**
If port 3000 is in use, change it in:
- `package.json` script
- `services/user.ts` API_URL

### 3. **db.json is Your Database**
- Don't delete it
- Commit it to Git
- Back it up regularly

### 4. **Auto-Reload**
JSON Server watches `db.json` and reloads automatically

---

## 🎓 What You Learned

✅ REST API concepts (GET, POST, PATCH, DELETE)
✅ HTTP requests with Angular HttpClient
✅ Observables and subscribe pattern
✅ Error handling in HTTP calls
✅ JSON Server for rapid prototyping
✅ Real backend integration patterns

---

## 🚀 Next Steps

### Phase 2: Auth Guard
- Protect routes
- Redirect if not logged in
- Use real API for authentication

### Phase 3: Interceptors
- Add auth token to requests
- Handle errors globally
- Show loading spinner

### Phase 4: Production Backend
- Replace JSON Server with real API
- Just change API_URL
- Same code works!

---

## 📚 Resources

- **JSON Server Docs**: https://github.com/typicode/json-server
- **Angular HttpClient**: https://angular.dev/guide/http
- **RxJS Observables**: https://rxjs.dev/guide/observable

---

**Your app now uses a real API!** 🎉

Data persists permanently in `db.json` file.
