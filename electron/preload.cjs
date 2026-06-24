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

  // Check if running in Electron
  isElectron: true,

  // Platform information
  platform: process.platform,
});
