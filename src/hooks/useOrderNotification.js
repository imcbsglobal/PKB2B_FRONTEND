import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Custom hook for detecting and notifying new orders
 *
 * Behaviour:
 * - Polls orders API every 30 seconds
 * - When a NEW order is detected → starts looping the alert sound continuously
 * - Sound keeps looping until ALL pending orders are accepted (no more "pending" status)
 * - Silent button: user can mute/unmute manually at any time
 * - Works in both browser and packaged Electron .exe
 */
export function useOrderNotification(orders, showToast) {
  const latestOrderIdRef  = useRef(null);
  const audioRef          = useRef(null);
  const isFirstLoadRef    = useRef(true);
  const pollIntervalRef   = useRef(null);
  const isPlayingRef      = useRef(false);   // is the loop active?
  const isMutedRef        = useRef(false);   // user-pressed silent

  const [isMuted,   setIsMuted]   = useState(false);   // exposed to UI
  const [isAlerting, setIsAlerting] = useState(false); // exposed to UI

  const isElectron = !!window.electron?.isElectron;

  /* ─────────────────────────────────────────────
     Initialize Audio element
  ───────────────────────────────────────────── */
  useEffect(() => {
    let src = '/sounds/new-order.mp3';

    if (isElectron && window.electron?.getSoundPath) {
      try {
        const raw = window.electron.getSoundPath();
        src = 'file:///' + raw.replace(/\\/g, '/');
        console.log('🔊 Electron sound path:', src);
      } catch (e) {
        console.warn('⚠️ getSoundPath failed, using default:', e);
      }
    }

    const audio       = new Audio(src);
    audio.volume      = 1.0;
    audio.preload     = 'auto';
    audio.loop        = false; // we manage the loop manually to allow clean stop

    audio.addEventListener('canplaythrough', () => console.log('✅ Alert sound ready'));
    audio.addEventListener('error', (e)      => console.warn('⚠️ Sound load error:', e.type));

    // When the track ends, play again if the loop is still active
    audio.addEventListener('ended', () => {
      if (isPlayingRef.current && !isMutedRef.current) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [isElectron]);

  /* ─────────────────────────────────────────────
     Start the looping alert
  ───────────────────────────────────────────── */
  const startAlert = useCallback(() => {
    isPlayingRef.current = true;
    setIsAlerting(true);

    if (isMutedRef.current) return; // silent mode — visual only

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.warn('⚠️ Autoplay blocked, will retry on next interaction:', err.message);
        // Retry once on next user gesture
        const retry = () => {
          if (isPlayingRef.current && !isMutedRef.current && audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          document.removeEventListener('click', retry);
          document.removeEventListener('keydown', retry);
        };
        document.addEventListener('click',   retry, { once: true });
        document.addEventListener('keydown', retry, { once: true });
      });
    }
  }, []);

  /* ─────────────────────────────────────────────
     Stop the looping alert
  ───────────────────────────────────────────── */
  const stopAlert = useCallback(() => {
    isPlayingRef.current = false;
    setIsAlerting(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Also stop via IPC if Electron
    if (isElectron && window.electron?.stopSound) {
      window.electron.stopSound().catch(() => {});
    }
  }, [isElectron]);

  /* ─────────────────────────────────────────────
     Toggle Mute (Silent button)
  ───────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    setIsMuted(next);

    if (next) {
      // Mute: stop audio but keep alert active
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } else {
      // Unmute: resume if alert is still active
      if (isPlayingRef.current && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  /* ─────────────────────────────────────────────
     Watch orders list:
     • New order  → start alert
     • No pending orders → stop alert
  ───────────────────────────────────────────── */
  const checkOrders = useCallback(() => {
    if (!orders || orders.length === 0) return;

    const latestOrder    = orders[0];
    const currentLatestId = latestOrder?.order_id;
    if (!currentLatestId) return;

    // ── First load: just record the baseline, no alert ──
    if (isFirstLoadRef.current) {
      latestOrderIdRef.current = currentLatestId;
      isFirstLoadRef.current   = false;
      console.log('📋 Initial order ID set:', currentLatestId);
      return;
    }

    // ── New order arrived? ──
    if (latestOrderIdRef.current !== currentLatestId) {
      console.log('🔔 NEW ORDER DETECTED!', currentLatestId);
      latestOrderIdRef.current = currentLatestId;

      startAlert();

      // Desktop notification (Electron)
      if (window.electron?.showNotification) {
        window.electron
          .showNotification(
            '🔔 New Order Received!',
            `Order ID: ${currentLatestId}\nCustomer: ${latestOrder?.customer_name || 'N/A'}`
          )
          .catch(() => {});
      }

      // Toast
      showToast?.(`🔔 New Order! ID: ${currentLatestId}`, 'success');
    }

    // ── Check if ALL pending orders are now accepted ──
    if (isPlayingRef.current) {
      const hasPending = orders.some(
        (o) => (o.status || '').toLowerCase().trim() === 'pending'
      );

      if (!hasPending) {
        console.log('✅ No pending orders — stopping alert');
        stopAlert();
      }
    }
  }, [orders, showToast, startAlert, stopAlert]);

  useEffect(() => {
    checkOrders();
  }, [checkOrders]);

  /* ─────────────────────────────────────────────
     Polling
  ───────────────────────────────────────────── */
  const startPolling = useCallback((refreshCallback, interval = 30000) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    console.log(`🔄 Polling every ${interval / 1000}s`);
    pollIntervalRef.current = setInterval(() => {
      console.log('🔄 Polling orders...');
      refreshCallback();
    }, interval);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return {
    startPolling,
    stopPolling,
    stopAlert,   // call this when order is accepted externally
    toggleMute,  // call this from the Silent button
    isMuted,     // bind to Silent button icon
    isAlerting,  // true while looping sound is active
  };
}
