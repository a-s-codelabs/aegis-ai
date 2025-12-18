# Java/JDK Setup for Android Development

## Quick Setup Guide

React Native 0.76.1 requires **JDK 17 or higher**. Here are the installation options:

### Option 1: Install JDK 17 (Recommended)

**Using Chocolatey (if you have it):**
```powershell
choco install openjdk17
```

**Manual Installation:**
1. Download JDK 17 from one of these sources:
   - **Eclipse Adoptium (Recommended)**: https://adoptium.net/temurin/releases/?version=17
   - **Oracle JDK**: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - **Microsoft OpenJDK**: https://learn.microsoft.com/en-us/java/openjdk/download

2. Download the Windows x64 installer (.msi)

3. Run the installer and follow the prompts

4. **Set JAVA_HOME environment variable:**
   - Open System Properties → Advanced → Environment Variables
   - Under "System variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` (or wherever JDK was installed)
   - Click OK

5. **Add Java to PATH:**
   - In Environment Variables, find "Path" under System variables
   - Click "Edit" → "New"
   - Add: `%JAVA_HOME%\bin`
   - Click OK on all dialogs

6. **Verify installation:**
   ```powershell
   java -version
   ```
   Should show: `openjdk version "17.x.x"`

### Option 2: Use Android Studio's JDK

If you have Android Studio installed, it includes a JDK:

1. Find Android Studio's JDK location (usually):
   - `C:\Program Files\Android\Android Studio\jbr`
   - Or `%LOCALAPPDATA%\Android\Sdk\jbr`

2. Set JAVA_HOME to that path:
   ```powershell
   # In PowerShell (temporary for current session):
   $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

   # Or set permanently (see Option 1, step 4)
   ```

### Verify Setup

After setting JAVA_HOME, verify it works:

```powershell
# Check JAVA_HOME
echo $env:JAVA_HOME

# Check Java version
java -version

# Check javac (compiler)
javac -version
```

### Troubleshooting

**If `java -version` still doesn't work:**
1. Close and reopen your terminal/PowerShell
2. Restart your computer (to ensure environment variables are loaded)
3. Verify JAVA_HOME points to the JDK folder (not the bin subfolder)

**If Gradle still can't find Java:**
- Make sure JAVA_HOME points to the JDK root (e.g., `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot`)
- Not the bin folder
- Restart terminal after setting environment variables

### Next Steps

Once Java is installed and JAVA_HOME is set:
```bash
cd android-native
gradlew.bat app:installDebug
```

