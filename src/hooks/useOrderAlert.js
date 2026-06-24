import { useEffect, useRef } from 'react';
import { orderAPI } from '../Services/api';
import { dataCache } from '../utils/cache';

/**
 * Custom hook to monitor for new orders and play alert sound
 * @param {boolean} enabled - Whether order monitoring is enabled
 * @param {number} pollInterval - How often to check for new orders (in milliseconds)
 * @returns {object} { lastChecked, orderCount }
 */
export function useOrderAlert(enabled = true, pollInterval = 30000) {
  const previousCountRef = useRef(null);
  const lastCheckedRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize audio element
    if (!audioRef.current) {
      audioRef.current = new Audio('/order-alert.mp3');
      audioRef.current.volume = 0.8;
    }

    const checkForNewOrders = async () => {
      try {
        // Fetch fresh orders without using cache
        const response = await orderAPI.getOrders();
        const orders = Array.isArray(response.data) ? response.data : [];
        const currentCount = orders.length;

        lastCheckedRef.current = new Date();

        // Check if this is first load
        if (previousCountRef.current === null) {
          previousCountRef.current = currentCount;
          console.log(`[OrderAlert] Initial order count: ${currentCount}`);
          return;
        }

        // Compare counts - play alert if new orders detected
        if (currentCount > previousCountRef.current) {
          const newOrdersCount = currentCount - previousCountRef.current;
          console.log(`[OrderAlert] 🔔 ${newOrdersCount} new order(s) detected!`);
          
          // Play alert sound
          try {
            await audioRef.current.play();
          } catch (error) {
            console.warn('[OrderAlert] Could not play sound:', error.message);
          }

          // Update the cache so the Orders page refreshes
          dataCache.set('orders', orders);
          
          // Update previous count
          previousCountRef.current = currentCount;
        } else if (currentCount < previousCountRef.current) {
          // Handle case where orders might be deleted/canceled
          console.log(`[OrderAlert] Order count decreased from ${previousCountRef.current} to ${currentCount}`);
          previousCountRef.current = currentCount;
        }
      } catch (error) {
        console.error('[OrderAlert] Failed to check for new orders:', error);
      }
    };

    // Initial check
    checkForNewOrders();

    // Set up polling interval
    intervalRef.current = setInterval(checkForNewOrders, pollInterval);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval]);

  return {
    lastChecked: lastCheckedRef.current,
    orderCount: previousCountRef.current,
  };
}
