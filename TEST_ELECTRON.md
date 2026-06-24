# Testing the Electron Desktop App

## Pre-Flight Checklist

Before testing, ensure:
- ✅ All dependencies installed (`npm install`)
- ✅ Backend API is accessible (https://pkb2backend.myimc.in/api)
- ✅ (Optional) Notification sound at `public/sounds/new-order.mp3`

## Test 1: Development Mode

1. Open terminal in project directory
2. Run:
   ```bash
   npm run dev:electron
   ```
3. **Expected behavior**:
   - Vite dev server starts on http://localhost:5173
   - Electron window opens automatically
   - DevTools opens
   - React app loads inside Electron
   - You can navigate to Orders page

## Test 2: Order Notification System

1. Run the app in dev mode
2. Navigate to the Orders page
3. Check browser console - you should see:
   ```
   ✅ Notification sound loaded successfully
   📋 Initial order ID set: [some-order-id]
   🔄 Starting order polling every 5 seconds
   ```
4. Wait for console logs every 5 seconds:
   ```
   🔄 Polling for new orders...
   ```

## Test 3: Simulate New Order Notification

Since you can't manually create a new order in testing, you can:

### Option A: Add a test button in Orders.jsx

Add this temporarily to test notifications:

```javascript
// In Orders.jsx, add inside the component
const testNotification = () => {
  // Play sound
  const audio = new Audio('/sounds/new-order.mp3');
  audio.play();
  
  // Show desktop notification
  window.electron?.showNotification(
    '🔔 Test Order',
    'This is a test notification!'
  );
  
  // Show toast
  showToast('🔔 Test notification triggered!', 'success');
};

// Add button in JSX
<button onClick={testNotification}>Test Notification</button>
```

### Option B: Wait for Real Order

1. Leave the app running
2. Create a new order through the mobile app or another interface
3. Within 5 seconds, you should see:
   - 🔊 Audio notification plays
   - 💻 Windows desktop notification appears
   - 🎉 Toast notification in the app
   - Console log: `🔔 NEW ORDER DETECTED!`

## Test 4: System Tray

1. Run the app
2. Look for the PK icon in the Windows system tray (bottom-right)
3. Click the X button on the app window
4. **Expected**: Window hides but app still runs in tray
5. Double-click tray icon to show window again
6. Right-click tray icon to see menu:
   - Show App
   - Hide App
   - Quit

## Test 5: Build Windows Installer

1. Build the installer:
   ```bash
   npm run dist
   ```
2. **Expected**:
   - Vite builds the React app
   - Electron builder creates installer
   - Output: `dist/PK B2B Orders Setup 1.0.0.exe`
3. Run the installer
4. App gets installed to Program Files
5. Desktop and Start Menu shortcuts created

## Test 6: Production App

1. Install the app from the installer
2. Launch from desktop shortcut
3. Navigate to Orders page
4. **Expected**:
   - No DevTools
   - App looks like native Windows app
   - All features work the same
   - Polling continues in background
   - System tray works

## Verification Checklist

After testing, verify:

- [ ] App starts without errors
- [ ] Electron window opens correctly
- [ ] React app loads inside Electron
- [ ] Orders page displays data from API
- [ ] Console shows polling logs every 5 seconds
- [ ] System tray icon appears
- [ ] Closing window minimizes to tray
- [ ] Right-click tray shows menu
- [ ] Double-click tray shows/hides window
- [ ] (If sound file exists) Audio plays on notification
- [ ] Desktop notification shows (Electron)
- [ ] Toast notification shows (React)
- [ ] Build command creates installer
- [ ] Installer works and installs app

## Common Issues During Testing

### Issue: "Port 5173 already in use"
**Solution**: 
- Kill existing Vite process
- Or change port in `vite.config.js`

### Issue: "Cannot find module 'electron'"
**Solution**: 
```bash
npm install
```

### Issue: Audio doesn't play
**Solution**: 
- Check if `public/sounds/new-order.mp3` exists
- Try a different MP3 file
- Check Windows volume settings

### Issue: Desktop notification doesn't show
**Solution**: 
- Check Windows Settings → Notifications
- Enable notifications for the app
- Make sure `window.electron` is defined

### Issue: Build fails
**Solution**: 
```bash
npm run build    # Test React build first
npm run dist     # Then try full build
```

## Expected Console Logs

### On App Start:
```
✅ Notification sound loaded successfully
📋 Initial order ID set: ORD-12345
🔄 Starting order polling every 5 seconds
```

### Every 5 Seconds:
```
🔄 Polling for new orders...
```

### When New Order Detected:
```
🔔 NEW ORDER DETECTED! {
  previous: 'ORD-12345',
  current: 'ORD-12346'
}
```

## Performance Checks

- [ ] App starts in < 5 seconds
- [ ] Orders page loads in < 2 seconds
- [ ] Polling doesn't cause UI lag
- [ ] Memory usage stable over time
- [ ] CPU usage low when idle

## Security Checks

- [ ] `nodeIntegration: false` in main.cjs
- [ ] `contextIsolation: true` in main.cjs
- [ ] Preload script uses `contextBridge`
- [ ] No direct Node.js access in renderer

---

## Next Steps After Testing

1. ✅ If all tests pass → Ready for production
2. ⚠️ If issues found → Check troubleshooting in ELECTRON_README.md
3. 🚀 Deploy installer to users

---

**Testing Complete?** Proceed to build and distribute the installer!
