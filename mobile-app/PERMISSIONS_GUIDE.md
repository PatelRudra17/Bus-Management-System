# 📱 Permissions Guide - Bus Pass Management App

## Current Permissions

### 🌐 Network (No Warning)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
**Why:** API calls to backend server
**Warning Level:** ✅ None

### 📷 Camera (No Warning)
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```
**Why:** Take photo for pass application
**Warning Level:** ✅ None

### 🖼️ Media Access (Warning - Expected)
```xml
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VISUAL_USER_SELECTED" />
```
**Why:** Upload ID proof and photos for bus pass
**Warning Level:** ⚠️ Informational (Google Play declaration needed)
**Action Required:** None for development, declaration needed for Play Store

## Google Play Store Declaration

When publishing, you'll see this in Google Play Console:

### Question: "Why does your app need photo/video access?"

### Answer Template:
```
Core Use Case: Identity Verification and Document Upload

Our bus pass management application requires users to upload:

1. Government-issued identification documents (ID proof)
   - For identity verification during pass application
   - Required by transportation authorities

2. Recent user photographs
   - For printing on physical bus passes
   - For digital pass identification

3. Supporting documents
   - Student IDs for student passes
   - Senior citizen cards for senior passes
   - Disability certificates for accessible passes

This media access is essential and directly related to our app's
core functionality of creating valid, verified bus passes.
Users cannot complete pass applications without this capability.

Frequency: Access required during pass application and renewal
(typically 1-4 times per year per user).
```

## Alternative: Photo Picker (No Permission Needed)

For Android 13+, you can use the Photo Picker which doesn't require permissions:

```java
// Photo Picker - No permission needed!
ActivityResultLauncher<PickVisualMediaRequest> pickMedia =
    registerForActivityResult(new PickVisualMedia(), uri -> {
        if (uri != null) {
            // Use the selected photo
            imageView.setImageURI(uri);
        }
    });

// Launch picker
pickMedia.launch(new PickVisualMediaRequest.Builder()
    .setMediaType(ActivityResultContracts.PickVisualMedia.ImageOnly.INSTANCE)
    .build());
```

## Handling Permissions in Code

### Request Permission at Runtime:
```java
private static final int PERMISSION_REQUEST_CODE = 100;

private void requestMediaPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        // Android 13+
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.READ_MEDIA_IMAGES)
                != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.READ_MEDIA_IMAGES},
                PERMISSION_REQUEST_CODE);
        }
    } else {
        // Android 12 and below
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.READ_EXTERNAL_STORAGE)
                != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.READ_EXTERNAL_STORAGE},
                PERMISSION_REQUEST_CODE);
        }
    }
}

@Override
public void onRequestPermissionsResult(int requestCode,
        String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);

    if (requestCode == PERMISSION_REQUEST_CODE) {
        if (grantResults.length > 0 &&
                grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            // Permission granted - proceed with photo selection
            openGallery();
        } else {
            // Permission denied - show explanation
            Toast.makeText(this,
                "Permission needed to upload ID proof",
                Toast.LENGTH_SHORT).show();
        }
    }
}
```

## Summary

| Permission | Required | Warning | Action |
|------------|----------|---------|--------|
| Internet | ✅ Yes | None | Already configured |
| Camera | ✅ Yes | None | Already configured |
| Media Images | ✅ Yes | Informational | Declare on Play Store |
| Storage (old) | ❌ No | None | Removed |

## For Development

**Current configuration is perfect for development!**
- ✅ App will build
- ✅ App will run
- ✅ Permissions will work
- ⚠️ Warning is just informational

## For Production

When ready to publish:
1. Test on Android 13+ devices
2. Implement runtime permission requests
3. Fill out Google Play declaration form
4. Consider using Photo Picker for better UX

---

**You can ignore the warning and continue developing!** 🚀
