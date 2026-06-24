# 🛡️ Windows SmartScreen - Installation Guide

## Issue: Windows SmartScreen Blocking Installer

When you try to run `PK B2B Orders Setup 1.0.0.exe`, Windows SmartScreen may show:

> **Windows protected your PC**
> 
> Windows Defender SmartScreen prevented an unrecognized app from starting. Running this app might put your PC at risk.

This is **NORMAL** for new, unsigned applications.

---

## ✅ Why This Happens

### Unsigned Application
The app is **not digitally signed** with a code signing certificate because:
- Code signing certificates cost $200-500/year
- Requires company verification
- Takes 1-2 weeks to obtain

### SmartScreen Reputation
Windows SmartScreen blocks apps that:
- Are new (not downloaded by many users yet)
- Don't have a digital signature
- Haven't built up "reputation" with Microsoft

**This does NOT mean the app is dangerous!**

---

## 🔓 How to Install (3 Methods)

### Method 1: Bypass SmartScreen (Recommended)

1. **Double-click** the installer: `PK B2B Orders Setup 1.0.0.exe`

2. Windows SmartScreen appears:
   ```
   Windows protected your PC
   [Don't run]
   ```

3. Click **"More info"** (small link at bottom)

4. A button appears: **"Run anyway"**

5. Click **"Run anyway"**

6. Installer starts normally ✅

**Visual Guide:**
```
Step 1: SmartScreen Warning
┌────────────────────────────────┐
│ Windows protected your PC      │
│ [Don't run]                    │
│                                │
│ More info  ← Click here        │
└────────────────────────────────┘

Step 2: After clicking "More info"
┌────────────────────────────────┐
│ Windows protected your PC      │
│ [Don't run]                    │
│ [Run anyway]  ← Click here     │
└────────────────────────────────┘
```

---

### Method 2: Disable SmartScreen Temporarily

**⚠️ Not recommended for security reasons**

1. Open **Windows Security**
2. Go to **App & browser control**
3. Click **Reputation-based protection settings**
4. Turn OFF **Check apps and files**
5. Install the app
6. Turn SmartScreen back ON after installation

---

### Method 3: Add Exception in Windows Defender

1. Open **Windows Security**
2. Go to **Virus & threat protection**
3. Click **Manage settings**
4. Scroll to **Exclusions**
5. Click **Add or remove exclusions**
6. Add the installer file or installation folder

---

## 📋 Installation Steps (After Bypassing)

### Step 1: Run Installer
- Double-click `PK B2B Orders Setup 1.0.0.exe`
- Bypass SmartScreen (see Method 1)

### Step 2: Installation Wizard
1. Welcome screen → Click **Next**
2. Choose installation folder (default: `C:\Users\[You]\AppData\Local\Programs\PK B2B Orders`)
3. Choose shortcuts:
   - ☑️ Create desktop shortcut
   - ☑️ Create Start Menu shortcut
4. Click **Install**
5. Wait 30-60 seconds
6. Click **Finish**

### Step 3: First Launch
- Double-click desktop shortcut **OR**
- Open from Start Menu
- Login with your credentials
- Orders page appears!

---

## 🔐 Is This Safe?

### YES! The app is safe because:

✅ **You built it yourself** - You compiled the source code  
✅ **No malware** - Clean code, no suspicious activity  
✅ **Open source** - All code is visible in your project  
✅ **Local development** - Built on your own computer  
✅ **SmartScreen is cautious** - It blocks ALL new/unsigned apps  

### What SmartScreen Actually Checks:
- ❌ Digital signature (app doesn't have one)
- ❌ Download reputation (new app, no downloads yet)
- ❌ Microsoft's app catalog (not submitted)

**None of these indicate the app is malicious!**

---

## 🏢 For Company Deployment

If distributing to multiple users, you have options:

### Option 1: Build Reputation (Free)
- Users install using "Run anyway"
- After ~100+ installations, SmartScreen stops blocking
- Takes 2-4 weeks

### Option 2: Code Signing Certificate ($)
**Cost:** $200-500/year

**Benefits:**
- No SmartScreen warnings
- Professional appearance
- Trusted by Windows
- Builds user confidence

**Providers:**
- DigiCert
- Sectigo
- GlobalSign
- SSL.com

**Process:**
1. Purchase certificate
2. Verify company identity
3. Receive certificate file (.pfx)
4. Sign the installer during build
5. Distribute signed installer

### Option 3: Group Policy (Enterprise)
IT administrators can:
- Add app to trusted publishers
- Disable SmartScreen for specific files
- Deploy via System Center/Intune

---

## 🛠️ How to Sign the App (Optional)

If you have a code signing certificate:

### Step 1: Get Certificate
Purchase from DigiCert, Sectigo, etc.
Receive `.pfx` file + password

### Step 2: Update electron-builder.json
```json
{
  "win": {
    "certificateFile": "path/to/certificate.pfx",
    "certificatePassword": "your-password",
    "signingHashAlgorithms": ["sha256"]
  }
}
```

### Step 3: Build
```bash
npm run dist
```

The installer will be digitally signed! ✅

---

## 📧 User Instructions (Share This)

**Email/Document to send to users:**

---

### Installing PK B2B Orders Desktop App

1. Download: `PK B2B Orders Setup 1.0.0.exe`

2. Double-click to install

3. **If Windows shows warning:**
   - Click "More info"
   - Click "Run anyway"
   - This is normal for new apps!

4. Follow installation wizard

5. Launch app from desktop shortcut

6. Login with your credentials

**Note:** The app is safe - Windows blocks it because it's new and not signed with an expensive certificate.

---

## 🔍 Verification

To verify the app is safe:

### Check File Properties
1. Right-click installer
2. Properties → Digital Signatures
3. (Will be empty if unsigned - this is OK)

### Check Installation Folder
After installation, check:
```
C:\Users\[You]\AppData\Local\Programs\PK B2B Orders\
```

Should contain:
- `PK B2B Orders.exe`
- `resources/` folder
- Standard Electron files

### No Suspicious Activity
App only:
- ✅ Connects to your API server
- ✅ Stores login tokens locally
- ✅ Shows order notifications
- ❌ NO external connections
- ❌ NO data collection
- ❌ NO background processes

---

## 🆘 Troubleshooting

### SmartScreen keeps blocking
**Solution:**
- Make sure you clicked "More info"
- Look for "Run anyway" button
- If not there, try Method 2 (disable temporarily)

### Installer won't run at all
**Solution:**
- Right-click installer → Run as administrator
- Check if antivirus is blocking (add exception)

### Installation fails
**Solution:**
- Close any running Electron apps
- Delete old installation folder
- Run installer as administrator

### App won't start after install
**Solution:**
- Check if Windows Defender blocked it
- Add exception in Windows Security
- Check installation folder exists

---

## 📊 Comparison

| Solution | Cost | Setup Time | User Experience |
|----------|------|------------|-----------------|
| **"Run anyway"** | Free | 0 min | Users see warning once |
| **Build reputation** | Free | 2-4 weeks | Warning decreases over time |
| **Code signing** | $200-500/yr | 1-2 weeks | No warnings ✅ |
| **Enterprise policy** | Free | 1 day | No warnings (enterprise) |

---

## ✅ Recommendation

**For now:** Use **"Run anyway"** method
- ✅ Free
- ✅ Immediate
- ✅ Safe
- ✅ Easy for users

**For future:** Consider **code signing** if:
- Distributing to 50+ users
- Want professional image
- Budget allows $200-500/year

---

## 📝 Summary

1. **SmartScreen blocking is NORMAL** for unsigned apps
2. **Your app is SAFE** - you built it yourself
3. **Users can bypass** using "Run anyway"
4. **Optional:** Sign app with certificate to avoid warnings

**The app works perfectly - SmartScreen is just being cautious!** 🛡️

---

**Need help?** Check ELECTRON_README.md for full documentation.
