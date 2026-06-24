import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for detecting and notifying new orders
 * Features:
 * - Polls orders API every 5 seconds
 * - Detects new orders by comparing latest order ID
 * - Plays notification sound
 * - Shows Windows desktop notification (in Electron)
 * - Shows React toast notification
 * - Skips notification on first load
 */
export function useOrderNotification(orders, showToast) {
  const latestOrderIdRef = useRef(null);
  const audioRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const pollIntervalRef = useRef(null);

  // Initialize audio on mount
  useEffect(() => {
    try {
      audioRef.current = new Audio('/sounds/new-order.mp3');
      audioRef.current.volume = 0.7; // Set volume to 70%
      audioRef.current.preload = 'auto';
      
      // Test audio loading
      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('✅ Notification sound loaded successfully');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.warn('⚠️ Failed to load notification sound:', e);
        console.warn('⚠️ Make sure file exists at: public/sounds/new-order.mp3');
      });

      audioRef.current.addEventListener('loadeddata', () => {
        console.log('📢 Audio file loaded, duration:', audioRef.current.duration, 'seconds');
      });
    } catch (error) {
      console.warn('⚠️ Could not initialize audio:', error);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Check for new orders
  const checkForNewOrders = useCallback(() => {
    if (!orders || orders.length === 0) {
      return;
    }

    // Get the latest order (assuming orders are sorted by date, newest first)
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

      // Update the latest order ID
      latestOrderIdRef.current = currentLatestId;

      // Play notification sound 2 times for alert
      if (audioRef.current) {
        console.log('🔊 Attempting to play notification sound (2 times)...');
        
        const playSound = async () => {
          try {
            audioRef.current.currentTime = 0; // Reset to start
            await audioRef.current.play();
            console.log('✅ Sound played (1st time)');
            
            // Wait for sound to finish, then play again
            setTimeout(async () => {
              try {
                audioRef.current.currentTime = 0;
                await audioRef.current.play();
                console.log('✅ Sound played (2nd time)');
              } catch (error) {
                console.warn('❌ Failed to play second time:', error.message);
              }
            }, audioRef.current.duration * 1000 + 200); // Wait for duration + 200ms gap
          } catch (error) {
            console.warn('❌ Failed to play notification sound:', error.message);
            console.warn('💡 Tip: Some browsers block autoplay. User interaction may be needed first.');
          }
        };
        
        playSound();
      } else {
        console.warn('⚠️ Audio not initialized');
      }

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
  }, [orders, showToast]);

  // Effect to check for new orders whenever orders change
  useEffect(() => {
    checkForNewOrders();
  }, [checkForNewOrders]);

  // Start/stop polling interval
  const startPolling = useCallback((refreshCallback, interval = 30000) => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    console.log(`🔄 Starting order polling every ${interval / 1000} seconds`);

    // Set up new polling interval
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
