# Quick Start Guide - PK B2B Orders Desktop App

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies (First Time Only)

Open Command Prompt or PowerShell in the project directory and run:

```bash
cd c:\Projects\PEEKAY\PKB2B_FRONTEND
npm install
```

### Step 2: Add Notification Sound (Optional)

Download a notification sound and save it as:
```
public/sounds/new-order.mp3
```

**Free sound sources:**
- https://notificationsounds.com/
- https://freesound.org/

### Step 3: Run or Build

#### Option A: Development Mode (Recommended for Testing)

```bash
npm run dev:electron
```

This opens the app with hot-reload and DevTools for debugging.

#### Option B: Build Windows Installer

```bash
npm run dist
```

This creates: `dist/PK B2B Orders Setup 1.0.0.exe`

Double-click the installer to install the app on your Windows PC.

---

## 📋 What You Get

✅ **Real-time order notifications** every 5 seconds  
✅ **Audio alert** when new orders arrive  
✅ **Windows desktop notification** with order details  
✅ **Toast notification** inside the app  
✅ **System tray integration** - app runs in background  
✅ **Complete order management** UI  

---

## 🔧 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev:electron` | Run app in development mode |
| `npm run build` | Build React app only |
| `npm run dist` | Build Windows installer |
| `npm run dist:win` | Build Windows installer (explicit) |

---

## 🎯 How It Works

1. App starts and loads current orders
2. Every 5 seconds, it checks for new orders
3. When a new order is detected:
   - 🔊 Plays sound
   - 💻 Shows Windows notification
   - 🎉 Shows toast in app
4. You can minimize to system tray - app keeps running

---

## ⚠️ Important Notes

- **First Load**: Won't notify for existing orders on startup
- **New Orders Only**: Only notifies for orders received AFTER app starts
- **Background Running**: Closing window minimizes to tray (right-click to quit)
- **Polling**: Checks every 5 seconds (configurable in code)

---

## 🆘 Troubleshooting

**Problem**: App won't start
- Check if port 5173 is available
- Run `npm install` again

**Problem**: No sound
- Ensure `public/sounds/new-order.mp3` exists
- Check Windows volume settings

**Problem**: No notifications
- Check Windows notification settings
- Enable notifications for the app

---

## 📁 Output Files After Build

```
dist/
  └── PK B2B Orders Setup 1.0.0.exe   ← Windows installer
```

---

**Need help?** Check `ELECTRON_README.md` for detailed documentation.
