# Anti-Scam Mobile App

React Native mobile application for the Anti-Scam project with native permissions support.

## Setup

### Prerequisites

- Node.js >= 18
- pnpm (or npm/yarn)
- Android SDK (API 24+)
- JDK 17+
- Android device or emulator with USB debugging enabled

### Installation

```bash
cd mobile
pnpm install
```

### Native Dependencies Setup

After installing npm packages, you need to link native dependencies:

```bash
# For Android, rebuild the native project
cd ../android-native
./gradlew clean
./gradlew app:assembleDebug
```

**Note:** `react-native-permissions` requires native code linking. The Android project is already configured, but you may need to rebuild after adding new permissions.

## Development

### Running as Native App

The app runs as a native Android application with React Native UI. Follow these steps:

#### Step 1: Start Metro Bundler

```bash
cd mobile
pnpm start
```

This starts the Metro bundler on `http://localhost:8081` which serves the JavaScript bundle to the Android app.

#### Step 2: Build and Install on Android

**Option A: Using Gradle (Recommended for first-time setup)**

```bash
cd ../android-native
gradlew.bat app:installDebug
```

**Option B: Using React Native CLI**

```bash
cd mobile
pnpm android
```

#### Step 3: Grant Permissions

On first launch, the app will show a permission screen requesting:

1. **Contacts** - To identify trusted callers from your contact list
2. **Phone State** - To detect incoming calls and screen potential scams
3. **Display Over Other Apps** - To show call alerts during incoming calls

**Important:** For "Display Over Other Apps" permission:
- Tap "Grant" in the app
- You'll be redirected to Android Settings
- Enable "Display over other apps" for the Anti-Scam app
- Return to the app

### Permissions Flow

The app uses a permission-first approach:

1. **On Launch**: Permission screen appears if any permissions are missing
2. **Individual Grants**: Each permission can be granted individually
3. **Grant All**: Use "Grant All Permissions" button for quick setup
4. **Main App**: Once all permissions are granted, the main app screen appears

### Testing Permissions

To test permission flows:

```bash
# Reset app permissions (Android)
adb shell pm reset-permissions com.example.anti_scam

# Or uninstall and reinstall
adb uninstall com.example.anti_scam
```

## Project Structure

```
mobile/
├── App.tsx                    # Main React Native component
├── index.js                   # Entry point (registers app component)
├── src/
│   ├── components/
│   │   └── PermissionScreen.tsx  # Permission request UI
│   ├── hooks/
│   │   └── usePermissions.ts     # Permission management hook
│   └── store/
│       └── useAppStore.ts        # Zustand store
├── package.json
├── tsconfig.json
├── babel.config.js
└── metro.config.js
```

## Tech Stack

### Core
- **React Native 0.76.1** - Mobile framework
- **React 18.3.1** - UI library
- **TypeScript** - Type safety

### State Management
- **Zustand 5.0.2** - Lightweight state management

### Permissions & Native Features
- **react-native-permissions 4.1.5** - Native permission handling
- **react-native-contacts 7.0.8** - Contact access (optional, for future use)

### Development Tools
- **Metro** - JavaScript bundler
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## Code Quality

### Linting

```bash
pnpm lint
pnpm lint:fix
```

### Formatting

```bash
pnpm format
```

## State Management

Currently using **Zustand** for client/global UI state. React Query will be added in later phases for server data fetching.

## Integration with Android Native

The React Native app is integrated into the existing Android project at `/android-native`. The Android app:

- Uses `AntiScamApplication` as the React Native host
- `MainActivity` extends `ReactActivity` to display React Native UI
- Kotlin overlay module is available at `/android-native/app/src/main/java/com/example/anti_scam/overlay/`

## Troubleshooting

### Metro bundler not connecting

- Ensure Metro is running on `http://localhost:8081`
- Check that your device/emulator can reach `localhost` (use `adb reverse tcp:8081 tcp:8081` if needed)
- Verify `android:usesCleartextTraffic="true"` in AndroidManifest.xml

### Build errors

- Ensure JDK 17+ is installed and `JAVA_HOME` is set correctly
- Verify Android SDK is properly configured
- Check that React Native version matches in `package.json` and `android-native/gradle/libs.versions.toml`
- After adding new native dependencies, rebuild: `cd ../android-native && ./gradlew clean && ./gradlew app:assembleDebug`

### Red screen on app launch

- Check Metro bundler is running
- Verify `getMainComponentName()` in `MainActivity.kt` matches the component name in `index.js`
- Check device logs: `adb logcat | grep ReactNativeJS`

### Permission issues

**"Permission denied" errors:**
- Ensure permissions are declared in `android-native/app/src/main/AndroidManifest.xml`
- Check that you've granted permissions in Android Settings
- For overlay permission, manually enable in Settings > Apps > Anti-Scam > Display over other apps

**Permissions not showing:**
- Rebuild the native app after adding new permissions
- Clear app data: `adb shell pm clear com.example.anti_scam`
- Reinstall the app

**Overlay permission not working:**
- Android 6.0+ requires manual enable in Settings
- The app will redirect you to Settings automatically
- Ensure you enable it for the correct app package: `com.example.anti_scam`

### Native module linking issues

If `react-native-permissions` doesn't work:
1. Clean build: `cd ../android-native && ./gradlew clean`
2. Rebuild: `./gradlew app:assembleDebug`
3. Reinstall: `./gradlew app:installDebug`
4. Restart Metro bundler

