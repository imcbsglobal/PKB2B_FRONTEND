# 🔊 Sound Troubleshooting Guide

## Issue: Sound Not Playing

If you've added the sound file but can't hear the notification sound, follow these steps:

---

## ✅ Step 1: Verify Sound File

### Check File Location
The sound file MUST be at:
```
public/sounds/new-order.mp3
```

### Check File Format
- ✅ File extension: `.mp3`
- ✅ File name: `new-order.mp3` (exact name, case-sensitive)
- ✅ Audio format: MP3
- ✅ File not corrupted

### Test in File Explorer
1. Navigate to `c:\Projects\PEEKAY\PKB2B_FRONTEND\public\sounds\`
2. Double-click `new-order.mp3`
3. It should play in your default media player
4. If it doesn't play → File is corrupted or wrong format

---

## ✅ Step 2: Use the Sound Test Component

I've added a **Sound Test** widget to your Orders page.

### How to Use:
1. Run the app: `npm run dev:electron`
2. Navigate to Orders page
3. Look for the **"🔊 Sound Test"** box in the bottom-right corner
4. Click **"Load Sound"** button
5. Click **"Play Sound"** button
6. Check the status messages

### What the Status Means:

**✅ "Sound loaded successfully" + "Sound played successfully"**
→ Sound works! The issue is with the notification trigger.

**❌ "Failed to load"**
→ Sound file not found or wrong path

**❌ "Play failed: NotAllowedError"**
→ Browser autoplay blocked (see Step 3)

**❌ "Play failed: NotSupportedError"**
→ Wrong audio format or corrupted file

---

## ✅ Step 3: Fix Browser Autoplay Block

Modern browsers block autoplay to prevent annoying websites. This affects your app too.

### Solution A: User Interaction First (Recommended)

The sound will work AFTER the user interacts with the page.

**Test this:**
1. Open the app
2. Click ANYWHERE on the page (button, link, etc.)
3. Wait for a new order
4. Sound should play now

### Solution B: Allow Autoplay in Browser Settings

**For Chrome/Edge:**
1. Navigate to the Orders page
2. Click the lock icon 🔒 in the address bar
3. Find "Sound" permission
4. Change to "Allow"
5. Reload page

**For Electron (Production):**
Autoplay should work without restrictions in the packaged app.

---

## ✅ Step 4: Check Console Logs

Open DevTools (F12) and check the Console tab:

### Good Logs (Working):
```
✅ Notification sound loaded successfully
📢 Audio file loaded, duration: 3 seconds
📋 Initial order ID set: ORD-12345
🔊 Attempting to play notification sound...
✅ Sound played successfully!
```

### Bad Logs (Issues):

**If you see:**
```
⚠️ Failed to load notification sound
```
→ Sound file not found. Check file path.

**If you see:**
```
❌ Failed to play notification sound: NotAllowedError
💡 Tip: Some browsers block autoplay. User interaction may be needed first.
```
→ Browser blocked autoplay. User needs to click something first.

**If you see:**
```
⚠️ Audio not initialized
```
→ Audio failed to load. Check file format and path.

---

## ✅ Step 5: Check Volume

### System Volume
- Check Windows volume (bottom-right taskbar)
- Unmute if muted
- Increase volume to 50%+

### App Volume
The app sets volume to 70% by default.

To change it, edit `src/hooks/useOrderNotification.js`:
```javascript
audioRef.current.volume = 0.7; // Change to 1.0 for 100%
```

---

## ✅ Step 6: Check File Path in Electron

When running in Electron, the file path changes slightly.

### Development Mode:
File is loaded from: `http://localhost:5173/sounds/new-order.mp3`

### Production Mode:
File is bundled in the app at: `file:///sounds/new-order.mp3`

**To verify:**
1. Open DevTools Console
2. Type: `new Audio('/sounds/new-order.mp3').src`
3. Press Enter
4. Check the URL shown

---

## ✅ Step 7: Test Different Sound File

Your sound file might be corrupted or incompatible.

### Try a Simple Test File:
1. Download a known-good MP3 from: https://notificationsounds.com/
2. Save it as `new-order.mp3`
3. Replace the existing file
4. Test again

### Recommended Sound Characteristics:
- **Format**: MP3 (not WAV or OGG)
- **Duration**: 1-3 seconds
- **File Size**: < 500 KB
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Bit Rate**: 128 kbps or higher

---

## ✅ Step 8: Alternative Audio Formats

If MP3 doesn't work, try other formats:

### Option 1: Use WAV
```javascript
// In useOrderNotification.js
audioRef.current = new Audio('/sounds/new-order.wav');
```

### Option 2: Use OGG
```javascript
// In useOrderNotification.js
audioRef.current = new Audio('/sounds/new-order.ogg');
```

### Option 3: Use Base64 Embedded Audio
Embed the audio directly in the code (no external file needed):

```javascript
// This is more reliable but increases code size
const audioData = 'data:audio/mp3;base64,YOUR_BASE64_HERE';
audioRef.current = new Audio(audioData);
```

---

## ✅ Step 9: Verify Notification Trigger

Make sure a new order is actually detected.

### Check Console for:
```
🔄 Polling for new orders...
🔔 NEW ORDER DETECTED! { previous: 'ORD-001', current: 'ORD-002' }
```

If you don't see "NEW ORDER DETECTED", then:
- No new orders have arrived yet
- The order ID isn't changing
- Polling isn't working

### Force a Test Notification:

Add this temporary code to test (Orders.jsx):
```javascript
// Add this inside the Orders component
const testNotification = () => {
  const audio = new Audio('/sounds/new-order.mp3');
  audio.play()
    .then(() => console.log('✅ Test sound played'))
    .catch(e => console.error('❌ Test failed:', e));
  
  showToast('🔔 Test notification!', 'success');
};

// Add button in JSX
<button onClick={testNotification}>Test Sound</button>
```

---

## ✅ Step 10: Windows Sound Settings

Check Windows sound settings:

1. Right-click volume icon in taskbar
2. Open "Volume mixer"
3. Check if your browser/Electron is muted
4. Check if "App volume and device preferences" shows the app
5. Ensure app volume is not at 0%

---

## 🔍 Diagnostic Checklist

Go through this checklist:

- [ ] Sound file exists at `public/sounds/new-order.mp3`
- [ ] Sound file plays in media player
- [ ] Sound Test component shows "✅ Sound loaded"
- [ ] Sound Test component plays when clicking "Play Sound"
- [ ] Console shows "✅ Notification sound loaded successfully"
- [ ] Console shows "📢 Audio file loaded, duration: X seconds"
- [ ] Windows volume is not muted
- [ ] Browser/app volume is not muted
- [ ] User has clicked on the page (to allow autoplay)
- [ ] Console shows "🔔 NEW ORDER DETECTED!" when new order arrives
- [ ] Console shows "✅ Sound played successfully!" after detection

---

## 🎯 Most Common Issues

### Issue #1: Autoplay Blocked (Most Common)
**Symptom**: Sound works in Sound Test but not on new order
**Solution**: Click anywhere on the page before new order arrives

### Issue #2: Wrong File Path
**Symptom**: Console shows "Failed to load notification sound"
**Solution**: Verify file is at `public/sounds/new-order.mp3`

### Issue #3: Corrupted File
**Symptom**: File exists but won't load
**Solution**: Download a new sound file and replace

### Issue #4: Volume Too Low
**Symptom**: Sound loads but can't hear it
**Solution**: Check system volume and app volume

### Issue #5: No New Orders
**Symptom**: Sound never plays
**Solution**: Wait for a real new order or use test button

---

## 🚀 Quick Test Commands

### Test 1: Check if file exists
Open terminal:
```bash
dir "c:\Projects\PEEKAY\PKB2B_FRONTEND\public\sounds\new-order.mp3"
```
Should show file size and date.

### Test 2: Test in browser console
Open DevTools Console and paste:
```javascript
const audio = new Audio('/sounds/new-order.mp3');
audio.play();
```
Should play the sound.

### Test 3: Check file is loaded in network
1. Open DevTools → Network tab
2. Reload page
3. Look for `new-order.mp3` in the list
4. Should show 200 status code

---

## 📞 Still Not Working?

If you've tried everything and sound still doesn't work:

### Temporary Workaround:
Use the **desktop notification** and **toast notification** only (they work without sound):
- Comment out the audio play code in `useOrderNotification.js`
- The visual notifications will still work

### Debug Mode:
Add this to see exactly what's happening:
```javascript
// In useOrderNotification.js
console.log('Audio object:', audioRef.current);
console.log('Audio ready state:', audioRef.current?.readyState);
console.log('Audio network state:', audioRef.current?.networkState);
console.log('Audio src:', audioRef.current?.src);
console.log('Audio duration:', audioRef.current?.duration);
console.log('Audio paused:', audioRef.current?.paused);
```

---

## ✅ Remove Sound Test Component

Once sound is working, remove the test component:

In `src/pages/Orders.jsx`:
1. Remove: `import SoundTest from '../components/SoundTest';`
2. Remove: `<SoundTest />`

---

**Remember**: In production (packaged Electron app), autoplay restrictions are usually not an issue. The sound should work automatically.

---

**Last Updated**: June 24, 2026
