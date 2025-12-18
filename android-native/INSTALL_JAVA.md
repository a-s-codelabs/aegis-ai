# Install Java/JDK 17 - Quick Guide

## Option 1: Manual Installation (Recommended - No Admin Required)

1. **Download JDK 17:**
   - Go to: https://adoptium.net/temurin/releases/?version=17
   - Select: **Windows x64** → **.msi Installer**
   - Download the file (e.g., `OpenJDK17U-jdk_x64_windows_hotspot_17.0.x_x64.msi`)

2. **Run the installer:**
   - Double-click the downloaded .msi file
   - Follow the installation wizard
   - **Important:** Check "Set JAVA_HOME variable" during installation (if available)
   - Complete the installation

3. **Verify installation:**
   ```powershell
   java -version
   ```
   Should show: `openjdk version "17.x.x"`

4. **If JAVA_HOME is not set automatically:**
   - See "Set JAVA_HOME Manually" section below

## Option 2: Chocolatey (Requires Admin)

If you want to use Chocolatey, you **must run PowerShell as Administrator**:

1. **Right-click PowerShell** → **Run as Administrator**

2. **Run the installation:**
   ```powershell
   choco install openjdk17 -y
   ```

3. **If you still get permission errors:**
   - Close all Chocolatey processes
   - Delete the lock file: `C:\ProgramData\chocolatey\lib\b15f6a0b4887f5441348471dad20e30534334204`
   - Try again as Administrator

## Set JAVA_HOME Manually

### Find Java Installation Path

Common locations:
- `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`
- `C:\Program Files\Java\jdk-17.x.x`
- `C:\Program Files\Microsoft\jdk-17.x.x`

### Set JAVA_HOME (Permanent)

1. **Open System Properties:**
   - Press `Win + R`
   - Type: `sysdm.cpl` → Enter
   - Go to **Advanced** tab → Click **Environment Variables**

2. **Add JAVA_HOME:**
   - Under **System variables**, click **New**
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` (your actual path)
   - Click **OK**

3. **Add to PATH:**
   - Find **Path** in System variables → Click **Edit**
   - Click **New** → Add: `%JAVA_HOME%\bin`
   - Click **OK** on all dialogs

4. **Restart your terminal/PowerShell**

5. **Verify:**
   ```powershell
   echo $env:JAVA_HOME
   java -version
   ```

### Set JAVA_HOME (Temporary - Current Session Only)

```powershell
# Find Java first (run the helper script)
cd android-native
.\set-java-home.ps1

# Or set manually
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot"
```

## Quick Test

After installation, test if everything works:

```powershell
# Check Java version
java -version

# Check JAVA_HOME
echo $env:JAVA_HOME

# Try building Android app
cd android-native
gradlew.bat app:installDebug
```

## Troubleshooting

### "java is not recognized"
- JAVA_HOME is not set, or
- `%JAVA_HOME%\bin` is not in PATH
- **Solution:** Set JAVA_HOME and add to PATH (see above)

### "JAVA_HOME is not set" (Gradle error)
- JAVA_HOME environment variable is not set
- **Solution:** Set JAVA_HOME permanently or use `.\set-java-home.ps1` script

### Permission Denied (Chocolatey)
- Chocolatey requires Administrator privileges
- **Solution:** Run PowerShell as Administrator, or use manual installation (Option 1)

