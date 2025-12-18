# Android Native Project

Android native project with React Native integration.

## Prerequisites

### Required Software

1. **JDK 17 or higher** (Required for React Native 0.76.1)
   - Download from: https://adoptium.net/temurin/releases/?version=17
   - Or install via Chocolatey: `choco install openjdk17`
   - See [SETUP_JAVA.md](./SETUP_JAVA.md) for detailed instructions

2. **Android SDK** (API 24+)
   - Usually installed with Android Studio
   - Or install via command line tools

3. **Android device or emulator** with USB debugging enabled

### Environment Variables

Set the following environment variables:

- `JAVA_HOME` - Path to JDK installation (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`)
- `ANDROID_HOME` - Path to Android SDK (e.g., `%LOCALAPPDATA%\Android\Sdk`)

**Quick Setup (PowerShell):**

```powershell
# Find Java automatically
cd android-native
.\set-java-home.ps1

# Or set manually for current session
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
```

## Building the App

### First Time Setup

1. **Install Java/JDK 17+** (if not already installed)
   - See [SETUP_JAVA.md](./SETUP_JAVA.md)

2. **Set JAVA_HOME** (if not set permanently)
   ```powershell
   # Run the helper script
   .\set-java-home.ps1

   # Or set manually
   $env:JAVA_HOME = "C:\path\to\jdk-17"
   ```

3. **Verify Java is accessible:**
   ```powershell
   java -version
   # Should show: openjdk version "17.x.x"
   ```

### Build and Install

**Option 1: Using Gradle directly**
```bash
cd android-native
gradlew.bat app:installDebug
```

**Option 2: Using React Native CLI** (from mobile directory)
```bash
cd mobile
pnpm android
```

### Development Workflow

1. **Start Metro bundler** (Terminal 1):
   ```bash
   cd mobile
   pnpm start
   ```

2. **Build and install app** (Terminal 2):
   ```bash
   cd android-native
   gradlew.bat app:installDebug
   ```

3. **Verify on device:**
   - App should launch showing "ANTI-SCAM home" screen
   - Visits counter should increment

## Project Structure

```
android-native/
├── app/
│   ├── src/main/
│   │   ├── java/com/example/anti_scam/
│   │   │   ├── AntiScamApplication.kt    # React Native host
│   │   │   ├── MainActivity.kt          # React Native activity
│   │   │   └── overlay/
│   │   │       └── OverlayManager.kt    # Kotlin overlay stub
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/
│   └── libs.versions.toml               # React Native version config
└── settings.gradle.kts
```

## Troubleshooting

### JAVA_HOME not set

**Error:** `ERROR: JAVA_HOME is not set and no 'java' command could be found`

**Solution:**
1. Install JDK 17+ (see [SETUP_JAVA.md](./SETUP_JAVA.md))
2. Set JAVA_HOME environment variable
3. Add `%JAVA_HOME%\bin` to PATH
4. Restart terminal/PowerShell

**Quick fix (temporary):**
```powershell
.\set-java-home.ps1
```

### Gradle build fails

- Verify React Native dependencies in `gradle/libs.versions.toml`
- Check that `react-native` version matches in `mobile/package.json` and `gradle/libs.versions.toml`
- Ensure Android SDK is properly configured
- Try: `gradlew.bat clean` then rebuild

### Metro bundler connection issues

- Ensure Metro is running on `http://localhost:8081`
- Check `android:usesCleartextTraffic="true"` in AndroidManifest.xml
- For emulator: Use `10.0.2.2:8081` instead of `localhost:8081`
- For physical device: Use `adb reverse tcp:8081 tcp:8081`

### App crashes on launch

- Check device logs: `adb logcat | grep ReactNativeJS`
- Verify component name matches: `getMainComponentName()` in MainActivity.kt = "AntiScamMobile"
- Ensure Metro bundler is running
- Check that all React Native dependencies are properly synced

## React Native Integration

This Android project is integrated with React Native:

- **React Native version:** 0.76.1
- **Main component:** "AntiScamMobile" (registered in `mobile/index.js`)
- **Application class:** `AntiScamApplication` (hosts React Native)
- **Main Activity:** `MainActivity` (extends `ReactActivity`)

See `/mobile/README.md` for React Native setup and development.

