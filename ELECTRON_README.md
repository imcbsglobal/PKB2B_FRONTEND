# PK B2B Orders - Windows Desktop Application

This is a Windows Desktop Application built with Electron + React (Vite) that provides real-time order notifications for the PK B2B system.

## Features

### 🔔 Real-Time Order Notifications
- **Automatic Polling**: Checks for new orders every 5 seconds
- **Multi-Channel Notifications**:
  - 🔊 Audio notification sound
  - 💻 Windows desktop notification
  - 🎉 React toast notification (in-app)
- **Smart Detection**: Only notifies for genuinely new orders (not on first startup)
- **System Tray**: Minimizes to Windows system tray
- **Always Running**: Continues running in background even when window is closed

### 📋 Order Management
- View all orders with real-time updates
- Filter by type (Offer/Normal) and status (Pending/Accepted/Invoiced/Dispatched)
- Date range filtering
- Export to Excel
- Update order status
- View order details

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## Installation

1. **Navigate to the project directory**:
   ```bash
   cd c:\Projects\PEEKAY\PKB2B_FRONTEND
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Add notification sound** (optional but recommended):
   - Download a notification sound file (MP3 format)
   - Place it at: `public/sounds/new-order.mp3`
   - Free sound sources:
     - https://notificationsounds.com/
     - https://freesound.org/

## Development

### Run Development Mode

Run the React app with Electron in development mode:

```bash
npm run dev:electron
```

This will:
1. Start Vite dev server at http://localhost:5173
2. Wait for the server to be ready
3. Launch Electron window with hot-reload enabled
4. Open DevTools automatically

### Run Web Development Mode

Run only the React web app (without Electron):

```bash
npm run dev
```

## Building for Production

### Build Windows Executable

To create a Windows installer (.exe):

```bash
npm run dist
```

Or specifically for Windows:

```bash
npm run dist:win
```

This will:
1. Build the React app with Vite
2. Package it with Electron
3. Create a Windows installer

### Build Output

After running the build command, you'll find the installer in:

```
dist/
  └── PK B2B Orders Setup 1.0.0.exe
```

The installer includes:
- Full Windows installation wizard
- Desktop shortcut creation
- Start menu shortcut
- Uninstaller

### Installer Options

The NSIS installer provides:
- ✅ Choice of installation directory
- ✅ Desktop shortcut creation
- ✅ Start menu shortcut
- ✅ Automatic uninstaller

## How It Works

### Order Notification System

1. **Polling Mechanism**:
   - Every 5 seconds, the app fetches the latest orders from the API
   - Compares the latest order ID with the previously stored ID

2. **New Order Detection**:
   - If a new order ID is detected (and it's not the first load):
     - Plays audio notification sound (`/sounds/new-order.mp3`)
     - Shows Windows desktop notification with order details
     - Shows React toast notification in the app

3. **First Load Handling**:
   - On first startup, stores the current latest order ID
   - Does NOT trigger notifications for existing orders
   - Only notifies for orders received AFTER app startup

### Architecture

```
┌─────────────────────────────────────────┐
│           Electron Main Process          │
│  (Node.js - electron/main.cjs)          │
│                                         │
│  • Creates BrowserWindow                │
│  • Manages system tray                  │
│  • Handles Windows notifications        │
│  • IPC communication                    │
└─────────────────────────────────────────┘
                    │
                    │ IPC Bridge
                    │
┌─────────────────────────────────────────┐
│        Electron Preload Script          │
│  (electron/preload.js)                  │
│                                         │
│  • Exposes safe APIs to renderer        │
│  • Context isolation bridge             │
└─────────────────────────────────────────┘
                    │
                    │
┌─────────────────────────────────────────┐
│          React Renderer Process          │
│  (React + Vite - src/)                  │
│                                         │
│  • Orders.jsx - Main order page         │
│  • useOrderNotification.js - Hook      │
│  • Polls API every 5 seconds            │
│  • Detects new orders                   │
│  • Triggers notifications               │
└─────────────────────────────────────────┘
```

## Project Structure

```
PKB2B_FRONTEND/
├── electron/
│   ├── main.cjs              # Electron main process
│   └── preload.cjs           # Preload script (IPC bridge)
├── public/
│   ├── sounds/
│   │   └── new-order.mp3    # Notification sound
│   └── pk.png               # App icon
├── src/
│   ├── hooks/
│   │   └── useOrderNotification.js  # Order notification logic
│   ├── pages/
│   │   └── Orders.jsx       # Orders page with polling
│   └── Services/
│       └── api.js           # API service
├── electron-builder.json    # Electron builder config
├── package.json             # Dependencies and scripts
└── vite.config.js          # Vite configuration
```

## Configuration

### Electron Builder (electron-builder.json)

- **App ID**: `com.peekay.b2b.orders`
- **Product Name**: `PK B2B Orders`
- **Output Directory**: `dist/`
- **Target**: Windows NSIS installer (x64 and ia32)

### Notification Sound

To change the notification sound:
1. Replace `public/sounds/new-order.mp3` with your sound file
2. Keep the same filename or update in `useOrderNotification.js`

### Polling Interval

To change the polling interval (default: 5 seconds):

Edit `src/pages/Orders.jsx`:
```javascript
startPolling(refreshOrders, 5000); // Change 5000 to desired milliseconds
```

## Troubleshooting

### Notifications Not Showing

1. **Check Windows notification settings**:
   - Open Windows Settings → System → Notifications
   - Ensure notifications are enabled for the app

2. **Check sound file**:
   - Ensure `public/sounds/new-order.mp3` exists
   - Check browser console for audio loading errors

3. **Check Electron permissions**:
   - Windows may require notification permissions for the app

### Build Fails

1. **Clear node_modules and reinstall**:
   ```bash
   rmdir /s /q node_modules
   npm install
   ```

2. **Clear Electron cache**:
   ```bash
   npm run dist -- --clean
   ```

3. **Check Node.js version**:
   ```bash
   node --version  # Should be v18 or higher
   ```

### App Doesn't Start

1. **Check if port 5173 is available**:
   - Another Vite dev server might be running
   - Kill the process or change the port in `vite.config.js`

2. **Check API connection**:
   - Ensure the backend API is accessible
   - Check network connection

## System Tray

The app runs in the Windows system tray:
- **Double-click tray icon**: Show/hide app window
- **Right-click tray icon**: 
  - Show App
  - Hide App
  - Quit

When closing the window (X button), the app minimizes to tray instead of quitting.

## Scripts Reference

```json
{
  "dev": "vite",                          // Run web dev server only
  "dev:electron": "concurrently ...",     // Run Electron in dev mode
  "build": "vite build",                  // Build React app
  "dist": "npm run build && electron-builder",  // Build Windows installer
  "dist:win": "npm run build && electron-builder --win",  // Build for Windows
  "electron": "electron ."                // Run Electron (after build)
}
```

## API Endpoints Used

- **GET /orders/** - Fetches all orders (polled every 5 seconds)
- **POST /order/{id}/accept/** - Accept order
- **POST /order/{id}/invoiced/** - Mark order as invoiced
- **POST /order/{id}/dispatched/** - Mark order as dispatched

## Security Notes

- **Context Isolation**: Enabled for security
- **Node Integration**: Disabled in renderer process
- **Preload Script**: Uses context bridge for safe IPC
- **CSP**: Content Security Policy recommended for production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs (DevTools in dev mode)
3. Check Electron logs in production

## License

Private - PK B2B Internal Use Only

## Version History

### v1.0.0 (Initial Release)
- ✅ Electron + React (Vite) integration
- ✅ Real-time order polling (5 seconds)
- ✅ Audio notifications
- ✅ Windows desktop notifications
- ✅ React toast notifications
- ✅ System tray integration
- ✅ Order management UI
- ✅ Windows installer (NSIS)

---

Built with ❤️ using Electron + React + Vite
