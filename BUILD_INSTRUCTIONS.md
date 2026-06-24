# 🔨 Build Instructions

## Issue: Permission Denied Error

If you see `EPERM: Permission denied` error when running `npm run dist`, it means the dist folder is locked by a running process.

---

## ✅ Solution Steps

### **Step 1: Close All Electron Apps**

1. Close any "PK B2B Orders" windows
2. Press `Ctrl+Shift+Esc` to open Task Manager
3. Look for these processes:
   - `electron.exe`
   - `PK B2B Orders.exe`
4. Right-click → End Task

### **Step 2: Delete dist Folder**

**Option A: File Explorer**
1. Open File Explorer
2. Navigate to: `C:\Projects\PEEKAY\PKB2B_FRONTEND\`
3. Delete the `dist` folder
4. Empty Recycle Bin (optional)

**Option B: PowerShell (if Option A doesn't work)**
```powershell
cd C:\Projects\PEEKAY\PKB2B_FRONTEND
rmdir /s /q dist
```

### **Step 3: Build Again**

```bash
npm run dist
```

---

## 🚀 Quick Build Commands

### Standard Build
```bash
npm run dist
```
Creates: `dist/PK B2B Orders Setup 1.0.0.exe`

### Clean Build (New!)
```bash
npm run dist:clean
```
This will:
1. Clean dist folder
2. Build React app
3. Create installer

**Note**: You still need to close Electron apps first!

### Windows Only (Explicit)
```bash
npm run dist:win
```

---

## 🔍 Common Build Errors

### Error: EPERM Permission Denied
**Cause**: Electron app is running or dist folder is locked

**Solution**:
1. Close all Electron windows
2. End electron.exe in Task Manager
3. Delete dist folder
4. Try again

### Error: require is not defined
**Cause**: ES Module issue

**Solution**: Already fixed! (electron files use .cjs extension)

### Error: Cannot find module
**Cause**: Missing dependencies

**Solution**:
```bash
npm install
npm run dist
```

### Error: ENOENT no such file
**Cause**: Missing files or wrong paths

**Solution**:
- Check if `electron/main.cjs` exists
- Check if `electron/preload.cjs` exists
- Check if `public/sounds/` folder exists

---

## 📋 Build Checklist

Before building, make sure:

- [ ] All Electron windows closed
- [ ] No electron.exe in Task Manager
- [ ] dist folder deleted (or doesn't exist)
- [ ] `npm install` completed successfully
- [ ] Sound file exists at `public/sounds/new-order.mp3` (optional)
- [ ] No TypeScript/JavaScript errors

---

## 🎯 Build Process Flow

```
npm run dist
    ↓
npm run build (Vite builds React app)
    ↓
Creates: dist/ folder with HTML, CSS, JS
    ↓
electron-builder (Packages Electron app)
    ↓
Creates: dist/win-unpacked/ (unpacked app)
    ↓
Creates: dist/PK B2B Orders Setup 1.0.0.exe (installer)
```

---

## 📦 Build Output

After successful build:

```
dist/
├── win-unpacked/               ← Unpacked app (can run directly)
│   └── PK B2B Orders.exe
├── PK B2B Orders Setup 1.0.0.exe  ← Installer (distribute this)
└── builder-effective-config.yaml
```

### What to Distribute
**Give users**: `PK B2B Orders Setup 1.0.0.exe`

This is the installer that:
- Installs to Program Files
- Creates desktop shortcut
- Creates Start Menu shortcut
- Adds uninstaller

---

## 🧪 Testing the Built App

### Test Unpacked Version
Navigate to:
```
C:\Projects\PEEKAY\PKB2B_FRONTEND\dist\win-unpacked\
```

Double-click: `PK B2B Orders.exe`

This runs the app without installing.

### Test Installer
Double-click:
```
C:\Projects\PEEKAY\PKB2B_FRONTEND\dist\PK B2B Orders Setup 1.0.0.exe
```

Follow installation wizard.

---

## 💡 Tips

### Faster Development
Don't rebuild for every small change. Use:
```bash
npm run dev:electron
```

This gives you hot-reload and faster iteration.

### Production Build
Only run `npm run dist` when:
- Ready to test final version
- Ready to distribute to users
- Making a release

### First Build
First build takes longer (5-10 minutes):
- Downloads Electron binaries
- Downloads dependencies
- Creates installer

Subsequent builds are faster (2-3 minutes).

---

## 🔧 Troubleshooting Build Issues

### Build is Slow
**Normal**: First build takes 5-10 minutes
**If slower**: Check antivirus (may be scanning files)

### Build Fails at 50%
Check console for specific error message

### Build Succeeds but App Won't Start
Check if:
- Sound file exists (if using notifications)
- All dependencies installed
- Electron version compatible

### Installer Won't Run
Check Windows security settings:
- May need to "Run as Administrator"
- May need to allow unsigned apps

---

## 📞 Need Help?

1. Check error message carefully
2. Close all Electron apps
3. Delete dist folder
4. Try `npm install` again
5. Try `npm run dist` again

---

**Remember**: Always close Electron apps before building! 🔨
