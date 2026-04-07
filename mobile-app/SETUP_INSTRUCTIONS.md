# 🛠️ Android Studio Setup Instructions

## ✅ Fixed Issues

The Gradle configuration error has been resolved. The project is now ready to open in Android Studio.

## 📋 Step-by-Step Setup

### 1️⃣ Open Project in Android Studio

```
1. Launch Android Studio
2. Click "Open" (or File → Open)
3. Navigate to: C:\Users\Rudra\OneDrive\Desktop\bus 2\mobile-app
4. Click "OK"
```

### 2️⃣ Wait for Gradle Sync

Android Studio will automatically:
- Download Gradle wrapper (first time only)
- Download dependencies
- Index the project
- Build project structure

⏱️ **This may take 2-5 minutes on first open**

### 3️⃣ If Gradle Sync Fails

Try these solutions:

**Option A: Let Android Studio Download Wrapper**
```
Android Studio will automatically download gradle-wrapper.jar
Just wait for the sync to complete
```

**Option B: Manual Gradle Wrapper Setup**
```bash
# In Android Studio Terminal
./gradlew wrapper --gradle-version=8.2
```

**Option C: Use Android Studio's Gradle**
```
File → Settings → Build, Execution, Deployment → Gradle
Select: "Use Gradle from: 'wrapper'"
Click "Apply" and "OK"
```

### 4️⃣ Configure Backend Connection

Edit `ApiClient.java`:

```java
// Path: app/src/main/java/com/buspass/management/utils/ApiClient.java

// For Android Emulator (default)
private static final String BASE_URL = "http://10.0.2.2:5000/api/";

// For Real Device (change to your computer's IP address)
// Find your IP: Open CMD and type "ipconfig"
// Look for IPv4 Address (e.g., 192.168.1.100)
// private static final String BASE_URL = "http://192.168.1.100:5000/api/";
```

### 5️⃣ Run the App

#### On Emulator:
```
1. Tools → Device Manager → Create Device
2. Select: Pixel 6 Pro
3. Select: API 34 (Android 14)
4. Click "Finish"
5. Click "Run" (Green Play button)
6. Select your emulator
```

#### On Real Device:
```
1. Enable Developer Options:
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. Enable USB Debugging:
   - Settings → Developer Options
   - Enable "USB Debugging"

3. Connect device via USB
4. Allow USB Debugging prompt
5. Click "Run" in Android Studio
6. Select your device
```

## 🐛 Common Issues & Solutions

### Issue 1: "SDK Location Not Found"
```
Solution:
File → Project Structure → SDK Location
Set Android SDK Location to your SDK path
(Usually: C:\Users\YourName\AppData\Local\Android\Sdk)
```

### Issue 2: "Unsupported Java Version"
```
Solution:
File → Settings → Build, Execution, Deployment → Build Tools → Gradle
Set Gradle JDK to: Java 17 or higher
```

### Issue 3: "Cannot Resolve Symbol R"
```
Solution:
1. Build → Clean Project
2. Build → Rebuild Project
3. File → Invalidate Caches → Invalidate and Restart
```

### Issue 4: "Backend Connection Failed"
```
Solution:
1. Make sure backend server is running on port 5000
2. Check ApiClient.java BASE_URL is correct
3. For real device, use computer's IP (not localhost)
4. Disable firewall temporarily to test
```

### Issue 5: "Gradle Build Failed"
```
Solution:
Try these in order:
1. File → Sync Project with Gradle Files
2. Build → Clean Project
3. File → Invalidate Caches → Invalidate and Restart
4. Delete .gradle folder and .idea folder, then reopen project
```

## 📱 Testing the App

### Test Login:
```
1. Start backend server first
2. Run mobile app
3. Wait for splash screen
4. Register a new account:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: test123
5. Login with credentials
```

### Test Features:
- ✅ Registration
- ✅ Login
- ✅ Dashboard navigation
- ✅ Logout

## 🔧 Project Configuration

### Minimum Requirements:
- **Android Studio**: Arctic Fox or newer
- **JDK**: 17 or higher
- **Android SDK**: API 24+ (Android 7.0+)
- **Gradle**: 8.2
- **Backend**: Running on port 5000

### Dependencies Installed:
- Material Design Components
- Retrofit2 (API calls)
- Gson (JSON parsing)
- Glide (Image loading)
- ZXing (QR codes)
- AndroidX Libraries

## 📂 Project Structure

```
mobile-app/
├── app/
│   ├── src/main/
│   │   ├── java/com/buspass/management/
│   │   │   ├── activities/     # 10 Activity files
│   │   │   ├── api/            # API Service
│   │   │   ├── models/         # Data models
│   │   │   └── utils/          # Utilities
│   │   ├── res/
│   │   │   ├── layout/         # XML layouts
│   │   │   ├── values/         # Resources
│   │   │   └── menu/           # Menu files
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── build.gradle
├── settings.gradle
└── gradle.properties
```

## ✅ Verification Checklist

Before running:
- [ ] Backend server is running on port 5000
- [ ] Gradle sync completed successfully
- [ ] No red errors in code
- [ ] Device/Emulator is connected
- [ ] ApiClient.java has correct BASE_URL

## 🚀 Next Steps

After successful setup:
1. Test login/register functionality
2. Explore dashboard features
3. Add more screens and features
4. Test with real backend data
5. Customize UI as needed

## 📞 Need Help?

If you encounter issues:
1. Check Logcat for error messages (View → Tool Windows → Logcat)
2. Verify backend is accessible: `curl http://localhost:5000/api/health`
3. Check Android Studio's Event Log for build errors
4. Review this guide's troubleshooting section

---

**Happy Coding! 🎉**
