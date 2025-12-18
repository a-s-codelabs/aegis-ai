# Native App Setup Guide

This guide explains how to set up and run the Anti-Scam mobile app as a native Android application with proper permissions.

## Quick Start

### 1. Install Dependencies

```bash
cd mobile
pnpm install
```

### 2. Link Native Modules

After installing npm packages, rebuild the Android project:

```bash
cd ../android-native
./gradlew clean
./gradlew app:assembleDebug
```

### 3. Run the App

**Terminal 1 - Start Metro:**
```bash
cd mobile
pnpm start
```

**Terminal 2 - Install & Run:**
```bash
cd android-native
./gradlew app:installDebug
```

Or use React Native CLI:
```bash
cd mobile
pnpm android
```

## Permissions Setup

The app requires three permissions for full functionality:

### Required Permissions

1. **READ_CONTACTS** - Access device contacts to identify trusted callers
2. **READ_PHONE_STATE** - Detect incoming calls and screen potential scams
3. **SYSTEM_ALERT_WINDOW** - Display call alerts over incoming call screens

### Permission Flow

1. **On First Launch**: App shows permission screen
2. **Grant Individually**: Tap "Grant" for each permission
3. **Grant All**: Use "Grant All Permissions" button
4. **Overlay Permission**: Requires manual enable in Android Settings
   - App will redirect you automatically
   - Go to: Settings > Apps > Anti-Scam > Display over other apps

### Testing Permissions

Reset permissions for testing:
```bash
adb shell pm reset-permissions com.example.anti_scam
```

Or uninstall and reinstall:
```bash
adb uninstall com.example.anti_scam
cd android-native
./gradlew app:installDebug
```

## Tech Stack

### Core Libraries
- **react-native-permissions** - Native permission handling
- **react-native-contacts** - Device contact access
- **zustand** - State management

### Native Integration
- Android native project at `/android-native`
- React Native hosted in `MainActivity.kt`
- Permissions declared in `AndroidManifest.xml`

## Troubleshooting

### Permission Not Requesting

**Issue**: Permission dialog doesn't appear

**Solution**:
1. Check `AndroidManifest.xml` has permission declared
2. Rebuild native app: `./gradlew clean && ./gradlew app:assembleDebug`
3. Clear app data: `adb shell pm clear com.example.anti_scam`

### Overlay Permission Not Working

**Issue**: Can't enable "Display over other apps"

**Solution**:
1. Manually go to Android Settings
2. Apps > Anti-Scam > Advanced > Display over other apps
3. Enable the toggle
4. Return to app

### Build Errors After Adding Dependencies

**Issue**: Build fails after `pnpm install`

**Solution**:
```bash
cd android-native
./gradlew clean
./gradlew app:assembleDebug
```

This rebuilds with new native dependencies.

## Development Workflow

1. **Make Code Changes** → Edit React Native files in `/mobile`
2. **Hot Reload** → Changes appear automatically (Metro bundler)
3. **Add Native Dependency** → Rebuild Android project
4. **Test Permissions** → Reset permissions and test flow

## Next Steps

- [ ] Add iOS support (when needed)
- [ ] Implement contact sync functionality
- [ ] Add call screening integration
- [ ] Set up CI/CD for native builds

