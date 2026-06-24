# Configuration Guide

## Overview

This document describes all configuration options for the PK B2B Orders Electron Desktop Application.

---

## 1. Polling Interval

**Location**: `src/pages/Orders.jsx`

**Default**: 5000ms (5 seconds)

**To Change**:
```javascript
useEffect(() => {
  startPolling(refreshOrders, 5000); // ← Change this value
  
  return () => {
    stopPolling();
  };
}, [startPolling, stopPolling]);
```

**Recommendations**:
- **3000ms (3s)**: More responsive, higher server load
- **5000ms (5s)**: Balanced (default)
- **10000ms (10s)**: Lower server load, slower detection

---

## 2. Notification Sound

**Location**: `public/sounds/new-order.mp3`

**Format**: MP3 audio file

**To Change**:
1. Replace the MP3 file with your sound
2. Keep the same filename, or update in `src/hooks/useOrderNotification.js`:

```javascript
audioRef.current = new Audio('/sounds/your-sound-file.mp3');
```

**Sound Requirements**:
- Format: MP3, WAV, or OGG
- Duration: 1-3 seconds recommended
- Size: < 500KB recommended

---

## 3. Window Size

**Location**: `electron/main.cjs`

**Default**: 1200x800 (min: 800x600)

**To Change**:
```javascript
mainWindow = new BrowserWindow({
  width: 1200,        // ← Change width
  height: 800,        // ← Change height
  minWidth: 800,      // ← Change minimum width
  minHeight: 600,     // ← Change minimum height
  // ...
});
```

---

## 4. App Icon

**Location**: `public/pk.png`

**Usage**:
- Window icon
- System tray icon
- Installer icon

**Requirements**:
- Format: PNG
- Recommended size: 256x256 or 512x512
- Transparent background recommended

**To Change**:
1. Replace `public/pk.png` with your icon
2. Update references if filename changes

---

## 5. App Metadata

**Location**: `electron-builder.json`

```json
{
  "appId": "com.peekay.b2b.orders",           // Unique app identifier
  "productName": "PK B2B Orders",             // Display name
  "directories": {
    "output": "dist",                          // Build output directory
    "buildResources": "public"                 // Resources directory
  }
}
```

**Location**: `package.json`

```json
{
  "name": "peekay_frontend",
  "version": "1.0.0",        // App version (update for each release)
  "description": "...",      // App description
  "author": "...",           // Your name/company
  "homepage": "./"           // For Electron (use relative paths)
}
```

---

## 6. API Endpoints

**Location**: `src/Services/api.js`

```javascript
const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://pkb2backend.myimc.in/api';  // ← Production API URL
```

**To Change**:
1. Update production URL in `api.js`
2. Update Vite proxy in `vite.config.js` for development:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://your-backend-url.com',  // ← Change target
      changeOrigin: true,
      secure: false,
    }
  }
}
```

---

## 7. System Tray Configuration

**Location**: `electron/main.cjs`

**Icon**: Uses `public/pk.png` (resized to 16x16)

**Menu Items**:
```javascript
const contextMenu = Menu.buildFromTemplate([
  { label: 'Show App', click: ... },
  { label: 'Hide App', click: ... },
  { type: 'separator' },
  { label: 'Quit', click: ... },
]);
```

**To Add Menu Items**:
```javascript
{
  label: 'Your Menu Item',
  click: () => {
    // Your action here
  }
}
```

---

## 8. Auto-Start on Login (Optional)

**Not currently enabled**. To enable:

**Location**: `electron/main.cjs`

Add at the top:
```javascript
const AutoLaunch = require('auto-launch');

const appAutoLauncher = new AutoLaunch({
  name: 'PK B2B Orders',
  path: app.getPath('exe'),
});

app.whenReady().then(() => {
  appAutoLauncher.enable();
});
```

**Install dependency**:
```bash
npm install auto-launch
```

---

## 9. Notification Settings

**Location**: `src/hooks/useOrderNotification.js`

### Desktop Notification Urgency

```javascript
const notification = new Notification({
  title: title || 'New Order',
  body: body || 'A new order has been received',
  urgency: 'critical',        // ← Change: 'low', 'normal', 'critical'
  timeoutType: 'never',       // ← Change: 'default', 'never'
});
```

### Toast Notification Duration

**Location**: `src/hooks/useToast.js`

```javascript
const showToast = useCallback((message, type = 'info', duration = 3000) => {
  // ← Change duration (milliseconds)
});
```

---

## 10. Build Configuration

**Location**: `electron-builder.json`

### Windows Installer Options

```json
{
  "win": {
    "target": [
      {
        "target": "nsis",              // Installer type
        "arch": ["x64", "ia32"]        // Architectures
      }
    ],
    "icon": "public/pk.png"
  },
  "nsis": {
    "oneClick": false,                 // Show installation wizard
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "PK B2B Orders"
  }
}
```

**Common Changes**:

- **One-click installer**: Set `"oneClick": true`
- **No desktop shortcut**: Set `"createDesktopShortcut": false`
- **Change install location**: Modify `allowToChangeInstallationDirectory`

---

## 11. Development Server Port

**Location**: `vite.config.js`

```javascript
export default defineConfig({
  server: {
    port: 5173,  // ← Change port
  }
});
```

**Note**: If you change the port, also update in `electron/main.cjs`:

```javascript
if (isDev) {
  mainWindow.loadURL('http://localhost:5173');  // ← Update port
}
```

---

## 12. DevTools in Production

**Location**: `electron/main.cjs`

**Default**: DevTools disabled in production

**To Enable DevTools in Production**:
```javascript
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    // ...
    webPreferences: {
      devTools: true,  // ← Add this to force enable
    }
  });

  // Always open DevTools
  mainWindow.webContents.openDevTools();
}
```

---

## 13. Order Detection Logic

**Location**: `src/hooks/useOrderNotification.js`

**Default**: Compares order IDs

**Assumption**: Orders array is sorted by date (newest first)

**To Change Detection Logic**:

```javascript
// Current: Compare IDs
const latestOrder = orders[0];
const currentLatestId = latestOrder?.order_id;

// Alternative: Compare timestamps
const latestOrder = orders.sort((a, b) => 
  new Date(b.created_at) - new Date(a.created_at)
)[0];
```

---

## 14. Minimize on Close Behavior

**Location**: `electron/main.cjs`

**Default**: Minimize to tray on close

**To Change to Exit on Close**:
```javascript
mainWindow.on('close', (event) => {
  // Comment out or remove these lines:
  // if (!app.isQuitting) {
  //   event.preventDefault();
  //   mainWindow.hide();
  // }
  // return false;
});
```

---

## 15. CORS and Security

**Location**: `electron/main.cjs`

```javascript
webPreferences: {
  contextIsolation: true,    // Must stay true for security
  nodeIntegration: false,    // Must stay false for security
  enableRemoteModule: false, // Must stay false for security
}
```

**⚠️ WARNING**: Do not change these security settings unless you understand the implications.

---

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=https://pkb2backend.myimc.in/api
VITE_POLLING_INTERVAL=5000
VITE_NOTIFICATION_SOUND=/sounds/new-order.mp3
```

**Access in code**:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Summary of Key Files

| File | Purpose | Common Changes |
|------|---------|----------------|
| `electron/main.cjs` | Electron main process | Window size, tray menu, auto-start |
| `electron/preload.cjs` | IPC bridge | Add new IPC methods |
| `electron-builder.json` | Build configuration | Installer options, app metadata |
| `package.json` | Dependencies & scripts | Version number, author |
| `vite.config.js` | Vite configuration | Port, proxy settings |
| `src/pages/Orders.jsx` | Orders page | Polling interval |
| `src/hooks/useOrderNotification.js` | Notification logic | Sound file, detection logic |
| `src/Services/api.js` | API client | Backend URL |

---

## Configuration Best Practices

1. ✅ **Version Control**: Update version in `package.json` for each release
2. ✅ **Environment Variables**: Use `.env` for sensitive/environment-specific config
3. ✅ **Testing**: Test configuration changes in dev mode before building
4. ✅ **Documentation**: Update this file when adding new configuration options
5. ✅ **Security**: Never commit API keys or sensitive data

---

**Need help?** See `ELECTRON_README.md` for detailed documentation.

