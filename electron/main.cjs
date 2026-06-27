const { app, BrowserWindow, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, '../public/pk.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
      autoplayPolicy: 'no-user-gesture-required', // ← allow audio without user click
    },
    show: false,
    title: 'PK B2B - Orders Management',
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  // Create tray icon
  const iconPath = path.join(__dirname, '../public/pk.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  const resizedIcon = trayIcon.resize({ width: 16, height: 16 });
  
  tray = new Tray(resizedIcon);
  tray.setToolTip('PK B2B Orders');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Hide App',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click tray icon to show/hide window
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

// Handle IPC for showing Windows notifications
const { ipcMain } = require('electron');

ipcMain.handle('show-notification', async (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'New Order',
      body: body || 'A new order has been received',
      icon: path.join(__dirname, '../public/pk.png'),
      urgency: 'critical', // High priority notification
      timeoutType: 'never', // Stay until dismissed
    });
    notification.show();
    return { success: true };
  } else {
    console.warn('Notifications are not supported on this system');
    return { success: false, error: 'Notifications not supported' };
  }
});

// Handle IPC for playing notification sound
ipcMain.handle('play-sound', async () => {
  try {
    // Get the correct path to the sound file
    const soundPath = isDev
      ? path.join(__dirname, '../public/sounds/new-order.mp3')
      : path.join(process.resourcesPath, 'public/sounds/new-order.mp3');

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(soundPath)) {
      console.error('Sound file not found at:', soundPath);
      return { success: false, error: 'Sound file not found' };
    }

    // Use native audio playback (requires powershell on Windows)
    if (process.platform === 'win32') {
      const { exec } = require('child_process');
      
      // Play sound using PowerShell (native Windows method)
      const command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync();"`;
      
      exec(command, (error) => {
        if (error) {
          console.error('Error playing sound:', error);
        }
      });

      return { success: true };
    }

    return { success: false, error: 'Unsupported platform' };
  } catch (error) {
    console.error('Failed to play sound:', error);
    return { success: false, error: error.message };
  }
});

// Handle sync IPC for getting sound path
ipcMain.on('get-sound-path', (event) => {
  const soundPath = isDev
    ? path.join(__dirname, '../public/sounds/new-order.mp3')
    : path.join(process.resourcesPath, 'public/sounds/new-order.mp3');
  
  // Always return forward slashes so file:/// URL works
  event.returnValue = soundPath.replace(/\\/g, '/');
  console.log('📢 Sound path returned:', event.returnValue);
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else if (mainWindow) {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running in tray even when all windows are closed
  if (process.platform !== 'darwin') {
    // On Windows, keep running in system tray
    // User must explicitly quit from tray menu
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
