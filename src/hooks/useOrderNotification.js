import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for detecting and notifying new orders
 * Features:
 * - Polls orders API every 30 seconds
 * - Detects new orders by comparing latest order ID
 * - Plays notification sound (via IPC in Electron, Audio API in browser)
 * - Shows Windows desktop notification (in Electron)
 * - Shows React toast notification
 * - Skips notification on first load
 */
export function useOrderNotification(orders, showToast) {
  const latestOrderIdRef = useRef(null);
  const audioRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const pollIntervalRef = useRef(null);
  const isElectron = !!window.electron?.isElectron;

  // Initialize audio on mount (browser fallback only)
  useEffect(() => {
    if (isElectron) {
      // In Electron: get the correct file path and use it for Audio
      try {
        const soundPath = window.electron.getSoundPath();
        console.log('🔊 Electron sound path:', soundPath);
        
        // Convert Windows path to file:// URL
        const soundUrl = 'file:///' + soundPath.replace(/\\/g, '/');
        audioRef.current = new Audio(soundUrl);
        audioRef.current.volume = 1.0;
        audioRef.current.preload = 'auto';

        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('✅ Electron sound loaded:', soundUrl);
        });
        audioRef.current.addEventListener('error', (e) => {
          console.warn('⚠️ Electron Audio failed, will use IPC fallback:', e.type);
          audioRef.current = null; // Fallback to IPC
        });
      } catch (err) {
        console.warn('⚠️ Could not init Electron audio:', err);
        audioRef.current = null;
      }
    } else {
      // In browser: use normal relative URL
      try {
        audioRef.current = new Audio('/sounds/new-order.mp3');
        audioRef.current.volume = 0.7;
        audioRef.current.preload = 'auto';

        audioRef.current.addEventListener('canplaythrough', () => {
          console.log('✅ Browser sound loaded successfully');
        });
        audioRef.current.addEventListener('error', (e) => {
          console.warn('⚠️ Failed to load notification sound:', e);
        });
      } catch (error) {
        console.warn('⚠️ Could not initialize audio:', error);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isElectron]);

  // Play sound - tries Audio element first, then IPC, then PowerShell
  const playNotificationSound = useCallback(async () => {
    const playOnce = async () => {
      // Try Audio element first
      if (audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          await audioRef.current.play();
          console.log('✅ Sound played via Audio element');
          return true;
        } catch (err) {
          console.warn('⚠️ Audio element failed:', err.message);
        }
      }

      // Fallback: use Electron IPC (PowerShell native playback)
      if (isElectron && window.electron?.playSound) {
        try {
          const result = await window.electron.playSound();
          if (result?.success) {
            console.log('✅ Sound played via Electron IPC');
            return true;
          }
        } catch (err) {
          console.warn('⚠️ IPC sound failed:', err.message);
        }
      }

      console.warn('❌ All sound methods failed');
      return false;
    };

    // Play 1st time
    await playOnce();

    // Play 2nd time after a short gap
    setTimeout(async () => {
      await playOnce();
    }, 1500);
  }, [isElectron]);

  // Check for new orders
  const checkForNewOrders = useCallback(() => {
    if (!orders || orders.length === 0) {
      return;
    }

    const latestOrder = orders[0];
    const currentLatestId = latestOrder?.order_id;

    if (!currentLatestId) {
      return;
    }

    // Skip notification on first load
    if (isFirstLoadRef.current) {
      latestOrderIdRef.current = currentLatestId;
      isFirstLoadRef.current = false;
      console.log('📋 Initial order ID set:', currentLatestId);
      return;
    }

    // Check if there's a new order
    if (latestOrderIdRef.current !== currentLatestId) {
      console.log('🔔 NEW ORDER DETECTED!', {
        previous: latestOrderIdRef.current,
        current: currentLatestId,
      });

      latestOrderIdRef.current = currentLatestId;

      // Play notification sound (2x)
      playNotificationSound();

      // Show Windows desktop notification (Electron only)
      if (window.electron?.showNotification) {
        window.electron.showNotification(
          '🔔 New Order Received!',
          `Order ID: ${currentLatestId}\nCustomer: ${latestOrder?.customer_name || 'N/A'}`
        ).catch((error) => {
          console.warn('Failed to show desktop notification:', error);
        });
      }

      // Show React toast notification
      if (showToast) {
        showToast(
          `🔔 New Order Received! Order ID: ${currentLatestId}`,
          'success'
        );
      }
    }
  }, [orders, showToast, playNotificationSound]);

  // Effect to check for new orders whenever orders change
  useEffect(() => {
    checkForNewOrders();
  }, [checkForNewOrders]);

  // Start/stop polling interval
  const startPolling = useCallback((refreshCallback, interval = 30000) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    console.log(`🔄 Starting order polling every ${interval / 1000} seconds`);

    pollIntervalRef.current = setInterval(() => {
      console.log('🔄 Polling for new orders...');
      refreshCallback();
    }, interval);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      console.log('⏹️ Stopping order polling');
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startPolling,
    stopPolling,
    currentOrderId: latestOrderIdRef.current,
  };
}

