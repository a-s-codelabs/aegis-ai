# Microphone Troubleshooting Guide

## Problem: Audio Amplitude is 0.0

If you see `maxAmplitude: '0.000000'` in the console, your microphone is **connected** but **NOT sending audio** to the browser.

## Quick Fix Steps

### Step 1: Check Windows Microphone Settings

1. **Right-click the speaker icon** in the Windows taskbar
2. Select **"Sounds"** (or **"Sound settings"**)
3. Go to the **"Recording"** tab
4. Find **"BH900 PRO"** (or your microphone)
5. **Right-click** it → **Properties**
6. Go to **"Levels"** tab
7. **Set volume to 80-100%** (NOT 0%!)
8. **Uncheck "Mute"** if it's checked
9. Click **OK**

### Step 2: Test Microphone in Windows

1. Open **Windows Voice Recorder** app
2. Click the **record button**
3. **Speak into your microphone**
4. **Stop recording** and **play it back**
5. **If you can hear your voice**: Microphone works! The issue is browser-specific.
6. **If you can't hear your voice**: Microphone hardware issue - check connections

### Step 3: Check Windows Privacy Settings

1. Open **Windows Settings** (Windows key + I)
2. Go to **Privacy & Security** → **Microphone**
3. Ensure **"Microphone access"** is **ON**
4. Ensure **"Let apps access your microphone"** is **ON**
5. Scroll down and ensure your browser is **allowed**

### Step 4: Check Browser Permissions

1. In your browser, click the **lock icon** (🔒) in the address bar
2. Find **"Microphone"** in the permissions list
3. Ensure it's set to **"Allow"**
4. If it's blocked, click **"Reset permissions"** and refresh the page

### Step 5: Select Correct Microphone

1. In Windows Sound Settings → Recording tab
2. **Right-click** your microphone → **"Set as Default Device"**
3. **Right-click** again → **"Set as Default Communication Device"**

### Step 6: Check Microphone Hardware

1. **Unplug and replug** your earphones/microphone
2. Try a **different USB port** (if USB microphone)
3. Check if microphone works in **other apps**:
   - Discord
   - Microsoft Teams
   - Zoom
   - Skype

## What the Logs Tell You

### ✅ Good Signs:
- `✅ Microphone access granted!`
- `✅ Audio source created from microphone`
- `✅ Audio processor created`
- `✅✅✅ MICROPHONE TEST PASSED: Audio detected!`
- `maxAmplitude: '0.123456'` (any non-zero number)

### ❌ Bad Signs:
- `maxAmplitude: '0.000000'` ← **This is the problem!**
- `❌❌❌ CRITICAL: Audio amplitude is exactly 0.0!`
- `❌❌❌ MICROPHONE TEST FAILED: No audio detected!`

## Common Issues

### Issue 1: Microphone Volume at 0%
**Symptom**: `maxAmplitude: '0.000000'`  
**Fix**: Windows Sound Settings → Recording → Your Microphone → Properties → Levels → Set to 80-100%

### Issue 2: Microphone Muted
**Symptom**: `maxAmplitude: '0.000000'`  
**Fix**: Windows Sound Settings → Recording → Your Microphone → Properties → Levels → Uncheck "Mute"

### Issue 3: Wrong Microphone Selected
**Symptom**: Microphone works in other apps but not in browser  
**Fix**: Windows Sound Settings → Recording → Set your microphone as Default Device

### Issue 4: Browser Permissions Blocked
**Symptom**: Microphone works in Windows but not in browser  
**Fix**: Browser address bar → Lock icon → Microphone → Allow

### Issue 5: Windows Privacy Settings
**Symptom**: Microphone works in other apps but not in browser  
**Fix**: Windows Settings → Privacy → Microphone → Enable access

## Testing Your Microphone

After fixing settings, test again:

1. **Refresh the page**
2. Click **"Divert to AI Protection"**
3. **Watch the console** for:
   - `🔍 Testing microphone audio capture...`
   - `✅✅✅ MICROPHONE TEST PASSED: Audio detected!` ← **This means it's working!**
4. **Speak into your microphone**
5. You should see: `maxAmplitude: '0.XXXXX'` (non-zero number)

## Still Not Working?

If you've tried all steps and still see `maxAmplitude: '0.000000'`:

1. **Restart your computer** (sometimes Windows needs a restart)
2. **Update audio drivers**:
   - Device Manager → Sound, video and game controllers
   - Right-click your audio device → Update driver
3. **Try a different browser** (Chrome, Firefox, Edge)
4. **Check if microphone works in other apps** (Discord, Teams, etc.)
5. **Try a different microphone** (if available)

## Success Indicators

When it's working, you'll see:
- ✅ `✅✅✅ MICROPHONE TEST PASSED: Audio detected!`
- ✅ `maxAmplitude: '0.123456'` (non-zero)
- ✅ `🔊 Audio detected (amplitude: 0.123)`
- ✅ `🎤 ✅✅✅ CONFIRMED: Caller audio received by AI!`
- ✅ `🎤 Caller said: [your speech transcribed here]`

## Need More Help?

If none of these steps work, the issue might be:
- Hardware problem with the microphone
- Driver issue
- Windows audio service problem

Try:
- Restart Windows Audio service
- Reinstall audio drivers
- Test with a different microphone

