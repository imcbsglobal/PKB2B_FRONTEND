const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electron', {
  // Show Windows notification
  showNotification: async (title, body) => {
    try {
      return await ipcRenderer.invoke('show-notification', { title, body });
    } catch (error) {
      console.error('Failed to show notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Play notification sound via main process (works in packaged .exe)
  playSound: async () => {
    try {
      return await ipcRenderer.invoke('play-sound');
    } catch (error) {
      console.error('Failed to play sound:', error);
      return { success: false, error: error.message };
    }
  },

  // Get the correct path to the sound file (for packaged app)
  getSoundPath: () => {
    return ipcRenderer.sendSync('get-sound-path');
  },

  // Check if running in Electron
  isElectron: true,

  // Platform information
  platform: process.platform,
});
