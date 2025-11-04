# 🔧 Troubleshooting Guide

## Issue: Success Modal Not Showing

### Symptoms:
- Click "Add Profile" or "Save Changes"
- Modal closes but success message doesn't appear
- No error shown

### Possible Causes & Solutions:

---

## 1. Check if JSON Server is Running

### Problem:
API requests fail silently if JSON Server isn't running.

### Solution:
```bash
# Make sure BOTH servers are running:
npm run dev

# Or run separately:
# Terminal 1:
npm run api

# Terminal 2:
npm start
```

### Verify:
- Open: `http://localhost:3000/profiles`
- Should see JSON response
- If "Cannot GET", server isn't running

---

## 2. Check Browser Console

### Open DevTools:
- **Chrome/Edge**: F12 or Ctrl+Shift+I
- **Firefox**: F12
- Go to **Console** tab

### Look for:
```
✅ Profile added successfully: {...}
🎉 Showing success message: Profile added successfully!
showSuccessModal set to: true
```

### If you see errors:
```
❌ Error adding profile: {...}
```
Check the error message for details.

---

## 3. Check Network Tab

### Steps:
1. Open DevTools → **Network** tab
2. Click "Add Profile"
3. Look for POST request to `http://localhost:3000/profiles`

### Check Status:
- **200 OK** ✅ - Request successful
- **404 Not Found** ❌ - API server not running
- **500 Error** ❌ - Server error
- **Failed** ❌ - Network error

### Check Response:
- Click the request
- Go to **Response** tab
- Should see the created profile JSON

---

## 4. Verify Modal HTML Exists

### Check:
The success modal should be in `users.html`:

```html
<!-- Success Modal -->
<div class="modal-overlay" *ngIf="showSuccessModal" (click)="closeSuccessModal()">
  <div class="success-modal" (click)="$event.stopPropagation()">
    <div class="success-icon-circle">
      <i class="bi bi-check-lg"></i>
    </div>
    
    <h3 class="success-title">Success!</h3>
    
    <p class="success-message">{{ successMessage }}</p>
  </div>
</div>
```

### If missing:
The HTML file might have been corrupted. Restore from Git or recreate.

---

## 5. Check Component Variables

### In `users.ts`, verify:
```typescript
// Success message state
showSuccessModal: boolean = false;
successMessage: string = '';

// Method exists
showSuccessMessage(message: string): void {
  this.successMessage = message;
  this.showSuccessModal = true;
  // ...
}
```

---

## 6. Common Issues

### Issue: Modal appears then disappears immediately

**Cause**: Auto-close timeout is too short

**Solution**:
```typescript
// In showSuccessMessage method
setTimeout(() => {
  this.closeSuccessModal();
}, 2000); // Change to 3000 for 3 seconds
```

---

### Issue: Modal doesn't appear at all

**Cause**: CSS might be hiding it

**Solution**: Check `users.css` for:
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Make sure this is high */
}
```

---

### Issue: API call succeeds but modal doesn't show

**Cause**: Observable not subscribed properly

**Solution**: Make sure you're calling `.subscribe()`:
```typescript
this.userService.addProfile(profile).subscribe({
  next: (response) => {
    this.closeModal();
    this.showSuccessMessage('Profile added successfully!');
  }
});
```

---

## 7. Debug Steps

### Step 1: Add Console Logs
Already added in the code:
```typescript
console.log('✅ Profile added successfully:', response);
console.log('🎉 Showing success message:', message);
console.log('showSuccessModal set to:', this.showSuccessModal);
```

### Step 2: Check Logs
1. Open Console
2. Add a profile
3. Look for the logs above
4. If you see them, modal should appear

### Step 3: Check Modal State
In Console, type:
```javascript
// Get component instance (in Angular DevTools)
$0.showSuccessModal  // Should be true when modal shows
$0.successMessage    // Should have the message
```

---

## 8. Force Show Modal (Testing)

### Temporary Test:
In `users.ts`, add to `ngOnInit`:
```typescript
ngOnInit(): void {
  // ... existing code ...
  
  // TEST: Show modal after 2 seconds
  setTimeout(() => {
    this.showSuccessMessage('Test message');
  }, 2000);
}
```

If this works, the modal HTML/CSS is fine. Issue is with the API call.

---

## 9. Check for JavaScript Errors

### Common Errors:

**Error**: `Cannot read property 'showSuccessModal' of undefined`
**Solution**: Check `this` binding in callbacks

**Error**: `showSuccessMessage is not a function`
**Solution**: Method might be missing or misspelled

**Error**: `Cannot find name 'showSuccessModal'`
**Solution**: Variable not declared in component

---

## 10. Restart Everything

Sometimes a clean restart fixes issues:

```bash
# Stop all servers (Ctrl+C)

# Clear Angular cache
rm -rf .angular

# Restart
npm run dev
```

---

## Quick Checklist

When success modal doesn't show:

- [ ] JSON Server running on port 3000
- [ ] Angular app running on port 4200
- [ ] No errors in browser console
- [ ] Network request shows 200 OK
- [ ] Console logs show "Profile added successfully"
- [ ] Console logs show "Showing success message"
- [ ] Modal HTML exists in users.html
- [ ] Modal CSS exists in users.css
- [ ] showSuccessModal variable exists
- [ ] showSuccessMessage method exists
- [ ] Observable is subscribed with .subscribe()

---

## Still Not Working?

### Check These Files:

1. **users.ts** - Component logic
2. **users.html** - Modal HTML
3. **users.css** - Modal styling
4. **user.service.ts** - API calls
5. **db.json** - Database file

### Get Help:

1. Check browser console for errors
2. Check network tab for failed requests
3. Check if JSON Server is responding
4. Verify all files are saved
5. Try hard refresh (Ctrl+Shift+R)

---

**Most Common Fix**: Make sure `npm run dev` is running both servers! 🚀
