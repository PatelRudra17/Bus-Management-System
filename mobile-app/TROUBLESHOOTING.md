# 🔧 Mobile App Troubleshooting Guide

## ✅ Text Readability Issue - FIXED!
The text color has been added to all input fields. Rebuild the app to see the changes.

## 🔐 Available Test Accounts

You can login with any of these accounts:

### User Accounts:
- **Email:** setcargood@gmail.com | **Role:** User
- **Email:** raju@gmail.com | **Role:** User
- **Email:** rudrapatel7500@gmail.com | **Role:** User
- **Email:** test123@test.com | **Role:** User

### Admin Accounts:
- **Email:** admin@buspass.com | **Role:** Admin
- **Email:** raja@gmail.com | **Role:** Admin

**Note:** You'll need to know the passwords for these accounts, or register a new account.

## 🔍 Login Error Debugging

### Step 1: Check if you're using Emulator or Real Device

#### If using **Android Emulator** (AVD):
✅ Current API URL is correct: `http://10.0.2.2:5000/api/`
- No changes needed

#### If using **Real Device**:
❌ Need to change the API URL!

1. Find your computer's IP address:
   ```bash
   # On Windows (PowerShell or CMD):
   ipconfig

   # Look for "IPv4 Address" under your WiFi/Ethernet adapter
   # Example: 192.168.1.100
   ```

2. **Update ApiClient.java:**
   - Open: `mobile-app/app/src/main/java/com/buspass/management/utils/ApiClient.java`
   - Change line 15 from:
     ```java
     private static final String BASE_URL = "http://10.0.2.2:5000/api/";
     ```
   - To (use YOUR computer's IP):
     ```java
     private static final String BASE_URL = "http://192.168.1.100:5000/api/";
     ```
   - Rebuild the app

3. **Make sure your phone and computer are on the SAME WiFi network!**

### Step 2: Check Android Logcat for Errors

In Android Studio:
1. Click on "Logcat" tab at the bottom
2. Try to login in the app
3. Look for errors in red
4. Common errors:
   - `ConnectException` = Can't reach backend server
   - `401 Unauthorized` = Wrong email/password
   - `500 Internal Server Error` = Backend issue

### Step 3: Test Backend is Running

In your browser on the SAME device/emulator, open:
- **Emulator:** http://10.0.2.2:5000/api/
- **Real Device:** http://YOUR_COMPUTER_IP:5000/api/

You should see: "Cannot GET /api/" (this is normal, it means the server is reachable)

### Step 4: Register a New Account

If you don't know the password for existing accounts:
1. In the app, click "Don't have an account? Register"
2. Fill in all fields:
   - Full Name: Your Name
   - Email: yournewemail@test.com
   - Phone: 1234567890
   - Password: password123
3. Click Register
4. Then login with these credentials

## 🐛 Common Issues & Solutions

### Issue: "Error: Failed to connect to /10.0.2.2:5000"
**Solution:** Backend server is not running
```bash
cd backend
npm start
```

### Issue: "Error: Unable to resolve host"
**Solution:**
- Real device: Update IP address in ApiClient.java
- Check WiFi connection

### Issue: "Login failed. Please try again"
**Solution:**
- Wrong email or password
- Try registering a new account first

### Issue: Text still not visible
**Solution:**
1. In Android Studio: Build → Clean Project
2. Then: Build → Rebuild Project
3. Run the app again

## 📱 Quick Test Steps

1. ✅ Backend is running on port 5000
2. ✅ You have registered users in database
3. ⚠️ Check if using emulator or real device
4. ⚠️ Update IP address if using real device
5. ⚠️ Rebuild app after text color fixes
6. ⚠️ Try registering a new account with known password

## 📸 Screenshot Your Errors

If issues persist, take screenshots of:
1. The login screen (showing if text is visible now)
2. The error message
3. Android Studio Logcat errors (in red)

---

**Backend Status:** ✅ Running on port 5000
**Registered Users:** ✅ 8 users found
**Text Color:** ✅ Fixed
