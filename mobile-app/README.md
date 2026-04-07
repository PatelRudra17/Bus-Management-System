# 📱 Bus Pass Management Mobile App (Android - Java)

Android mobile application for the Bus Pass Management System built with Java.

## 🚀 Features

### User Features
- ✅ User Registration & Login
- ✅ Dashboard with Statistics
- ✅ Apply for Bus Pass
- ✅ View Pass History
- ✅ Download Pass as PDF
- ✅ QR Code Scanner
- ✅ Smart Card Management
- ✅ Travel History
- ✅ Recharge Smart Card
- ✅ Push Notifications
- ✅ Profile Management

### Admin Features
- ✅ Admin Dashboard
- ✅ Approve/Reject Applications
- ✅ Manage Users
- ✅ Manage Routes
- ✅ View Analytics

## 📋 Requirements

- **Android Studio**: Arctic Fox or newer
- **JDK**: 17 or higher
- **Android SDK**: API Level 24+ (Android 7.0+)
- **Backend Server**: Running on localhost:5000

## 🛠️ Setup Instructions

### 1. Open in Android Studio

```bash
1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to: C:\Users\Rudra\OneDrive\Desktop\bus 2\mobile-app
4. Click "OK"
```

### 2. Configure Backend URL

Open `app/src/main/java/com/buspass/management/utils/ApiClient.java`

```java
// For Android Emulator
private static final String BASE_URL = "http://10.0.2.2:5000/api/";

// For Real Device (use your computer's IP)
// private static final String BASE_URL = "http://192.168.1.100:5000/api/";
```

### 3. Sync Gradle

```
File → Sync Project with Gradle Files
```

### 4. Run the App

```
1. Connect your Android device or start an emulator
2. Click the "Run" button (Green Play icon)
3. Select your device
4. Wait for the app to install and launch
```

## 📁 Project Structure

```
mobile-app/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/buspass/management/
│   │       │   ├── activities/          # Activities (Screens)
│   │       │   ├── adapters/            # RecyclerView Adapters
│   │       │   ├── api/                 # API Service
│   │       │   ├── models/              # Data Models
│   │       │   ├── utils/               # Utility Classes
│   │       │   └── fragments/           # Fragments
│   │       ├── res/
│   │       │   ├── layout/              # XML Layouts
│   │       │   ├── values/              # Colors, Strings, Themes
│   │       │   ├── drawable/            # Images & Icons
│   │       │   └── mipmap/              # App Icons
│   │       └── AndroidManifest.xml
│   └── build.gradle                     # App dependencies
├── gradle/
├── build.gradle                         # Project configuration
└── settings.gradle
```

## 🔧 Key Technologies

- **Language**: Java 17
- **UI**: Material Design Components
- **Networking**: Retrofit2 + OkHttp3
- **JSON Parsing**: Gson
- **Image Loading**: Glide
- **QR Code**: ZXing
- **PDF Viewer**: AndroidPdfViewer

## 📱 Screens

1. **Splash Screen** - App launch animation
2. **Login Screen** - User authentication
3. **Register Screen** - New user registration
4. **Dashboard** - User/Admin dashboard with stats
5. **Apply Pass** - Bus pass application form
6. **My Passes** - View all passes
7. **Pass Details** - Detailed pass view with QR code
8. **Smart Card** - Smart card management
9. **Profile** - User profile & settings
10. **Admin Panel** - Admin management screens

## 🎨 Theming

The app follows Material Design 3 guidelines with:
- Primary Color: `#0c4a6e` (Dark Blue)
- Accent Color: `#22d3ee` (Cyan)
- Modern card-based UI
- Smooth animations
- Dark mode support (planned)

## 🔐 Authentication

- JWT Token-based authentication
- Tokens stored in SharedPreferences
- Auto-logout on token expiration
- Secure API calls with auth interceptor

## 📡 API Integration

All API calls go through Retrofit2:

```java
ApiService api = ApiClient.getClient().create(ApiService.class);
Call<AuthResponse> call = api.login(loginRequest);
```

## 🧪 Testing

### Run on Emulator
1. Create AVD: Tools → Device Manager → Create Device
2. Select: Pixel 6 Pro (API 34)
3. Run app

### Run on Real Device
1. Enable Developer Options
2. Enable USB Debugging
3. Connect device via USB
4. Allow USB Debugging prompt
5. Run app

## 📦 Build APK

### Debug APK
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### Release APK
```
Build → Generate Signed Bundle / APK
```

## 🚨 Troubleshooting

### Backend Connection Issues
```
Error: Unable to resolve host
Solution: Check BASE_URL in ApiClient.java
          Make sure backend is running
          For real device, use computer's IP
```

### Gradle Sync Failed
```
File → Invalidate Caches → Invalidate and Restart
```

### App Crashes
```
Check Logcat (View → Tool Windows → Logcat)
Filter by your package name: com.buspass.management
```

## 🔜 Upcoming Features

- [ ] Offline Mode
- [ ] Google Maps Integration
- [ ] Real-time Bus Tracking
- [ ] Push Notifications (FCM)
- [ ] Biometric Authentication
- [ ] Dark Theme
- [ ] Multi-language Support
- [ ] Payment Gateway Integration

## 📞 Support

For issues and queries:
- Check backend logs: `backend/server.log`
- Check Logcat in Android Studio
- Verify API endpoints are working

## 📄 License

MIT License - Same as parent project

---

**Next Steps**:
1. Open project in Android Studio
2. Sync Gradle
3. Run on emulator or device
4. Test all features

Happy Coding! 🎉
