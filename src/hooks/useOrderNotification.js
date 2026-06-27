import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Custom hook for detecting and notifying new orders
<<<<<<< HEAD
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
=======
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
>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722

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

<<<<<<< HEAD
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
=======
    const latestOrder = orders[0];
>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722
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
<<<<<<< HEAD
      console.log('🔔 NEW ORDER DETECTED!', currentLatestId);
      latestOrderIdRef.current = currentLatestId;

      startAlert();
=======
      console.log('🔔 NEW ORDER DETECTED!', {
        previous: latestOrderIdRef.current,
        current: currentLatestId,
      });

      latestOrderIdRef.current = currentLatestId;

      // Play notification sound (2x)
      playNotificationSound();
>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722

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
<<<<<<< HEAD
  }, [orders, showToast, startAlert, stopAlert]);
=======
  }, [orders, showToast, playNotificationSound]);
>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722

  useEffect(() => {
    checkOrders();
  }, [checkOrders]);

  /* ─────────────────────────────────────────────
     Polling
  ───────────────────────────────────────────── */
  const startPolling = useCallback((refreshCallback, interval = 30000) => {
<<<<<<< HEAD
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    console.log(`🔄 Polling every ${interval / 1000}s`);
=======
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    console.log(`🔄 Starting order polling every ${interval / 1000} seconds`);

>>>>>>> 5d9d8ec6f0b9f2152e5a77b3ab02894de5d97722
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

