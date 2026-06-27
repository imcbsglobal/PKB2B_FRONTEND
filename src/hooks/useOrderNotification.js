import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * useOrderNotification
 *
 * - Polls every 30s for new orders
 * - New order → loops alert sound continuously
 * - Sound stops IMMEDIATELY when all pending orders are accepted
 * - Silent button to mute/unmute
 * - Handles browser autoplay policy by unlocking audio on first user interaction
 * - Works in browser AND packaged Electron .exe
 */
export function useOrderNotification(orders, showToast) {
  const latestOrderIdRef  = useRef(null);
  const audioRef          = useRef(null);
  const isFirstLoadRef    = useRef(true);
  const pollIntervalRef   = useRef(null);
  const isPlayingRef      = useRef(false);
  const isMutedRef        = useRef(false);
  const audioUnlockedRef  = useRef(false); // tracks if autoplay is allowed

  const [isMuted,    setIsMuted]    = useState(false);
  const [isAlerting, setIsAlerting] = useState(false);
  const [needsClick, setNeedsClick] = useState(false); // show "click to enable sound" hint

  const isElectron = !!window.electron?.isElectron;

  /* ─────────────────────────────────────
     Build sound src URL
  ───────────────────────────────────── */
  function buildSoundSrc() {
    if (!isElectron) return '/sounds/new-order.mp3';
    try {
      const raw = window.electron.getSoundPath();
      return 'file:///' + raw.replace(/\\/g, '/').replace(/ /g, '%20');
    } catch (e) {
      return '/sounds/new-order.mp3';
    }
  }

  /* ─────────────────────────────────────
     Initialize Audio element
  ───────────────────────────────────── */
  useEffect(() => {
    const src   = buildSoundSrc();
    const audio = new Audio(src);
    audio.volume  = 1.0;
    audio.preload = 'auto';
    audio.loop    = true; // native loop — play() once to start, pause() to stop

    audio.addEventListener('canplaythrough', () =>
      console.log('✅ Sound ready:', src)
    );
    audio.addEventListener('error', () =>
      console.error('❌ Sound failed to load:', src, audio.error?.code)
    );

    audioRef.current = audio;

    // ── Unlock audio on first user interaction ──
    // Browsers block autoplay until the user has interacted with the page.
    // We silently play+pause on the first click/keydown to "unlock" the audio context.
    const unlock = async () => {
      if (audioUnlockedRef.current) return;
      try {
        audio.volume = 0;
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audioUnlockedRef.current = true;
        setNeedsClick(false);
        console.log('🔓 Audio unlocked');

        // If an alert was waiting, start it now
        if (isPlayingRef.current && !isMutedRef.current) {
          audio.currentTime = 0;
          audio.volume = 1.0;
          audio.play().catch(() => {});
        }
      } catch {
        // Will retry on next interaction
      }
    };

    document.addEventListener('click',     unlock, { passive: true });
    document.addEventListener('keydown',   unlock, { passive: true });
    document.addEventListener('mousedown', unlock, { passive: true });
    document.addEventListener('touchstart',unlock, { passive: true });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      document.removeEventListener('click',     unlock);
      document.removeEventListener('keydown',   unlock);
      document.removeEventListener('mousedown', unlock);
      document.removeEventListener('touchstart',unlock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isElectron]);

  /* ─────────────────────────────────────
     playAudio — central play helper
  ───────────────────────────────────── */
  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = 1.0;

    try {
      await audio.play();
      audioUnlockedRef.current = true;
      setNeedsClick(false);
      console.log('🔊 Sound playing (loop)');
    } catch (err) {
      console.warn('⚠️ play() blocked by browser:', err.message);
      // Show hint to user to click anywhere
      setNeedsClick(true);
    }
  }, []);

  /* ─────────────────────────────────────
     startAlert
  ───────────────────────────────────── */
  const startAlert = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;
    setIsAlerting(true);
    console.log('🔔 Alert started');

    if (isMutedRef.current) return;
    playAudio();
  }, [playAudio]);

  /* ─────────────────────────────────────
     stopAlert — instant stop
  ───────────────────────────────────── */
  const stopAlert = useCallback(() => {
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;
    setIsAlerting(false);
    setNeedsClick(false);
    console.log('🔕 Alert stopped');

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  /* ─────────────────────────────────────
     toggleMute — silent button
  ───────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    isMutedRef.current = next;
    setIsMuted(next);

    const audio = audioRef.current;
    if (!audio) return;

    if (next) {
      // Muting
      audio.pause();
      audio.currentTime = 0;
      setNeedsClick(false);
    } else {
      // Unmuting — this click also unlocks audio!
      if (isPlayingRef.current) {
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().then(() => {
          audioUnlockedRef.current = true;
          setNeedsClick(false);
        }).catch(() => {});
      }
    }
  }, []);

  /* ─────────────────────────────────────
     checkOrders
  ───────────────────────────────────── */
  const checkOrders = useCallback(() => {
    if (!orders || orders.length === 0) return;

    const latestOrder     = orders[0];
    const currentLatestId = latestOrder?.order_id;
    if (!currentLatestId) return;

    // First load — set baseline, no alert
    if (isFirstLoadRef.current) {
      latestOrderIdRef.current = currentLatestId;
      isFirstLoadRef.current   = false;
      console.log('📋 Baseline ID:', currentLatestId);
      return;
    }

    // New order detected
    if (latestOrderIdRef.current !== currentLatestId) {
      console.log('🔔 NEW ORDER:', currentLatestId);
      latestOrderIdRef.current = currentLatestId;

      startAlert();

      if (window.electron?.showNotification) {
        window.electron
          .showNotification(
            '🔔 New Order Received!',
            `Order ID: ${currentLatestId}\nCustomer: ${latestOrder?.customer_name || 'N/A'}`
          )
          .catch(() => {});
      }

      showToast?.(`🔔 New Order! ID: ${currentLatestId}`, 'success');
    }

    // Backup: stop if no pending remain
    if (isPlayingRef.current) {
      const hasPending = orders.some(
        (o) => (o.status || '').toLowerCase().trim() === 'pending'
      );
      if (!hasPending) {
        console.log('✅ No pending — auto-stopping');
        stopAlert();
      }
    }
  }, [orders, showToast, startAlert, stopAlert]);

  useEffect(() => {
    checkOrders();
  }, [checkOrders]);

  /* ─────────────────────────────────────
     Polling
  ───────────────────────────────────── */
  const startPolling = useCallback((refreshCallback, interval = 30000) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      refreshCallback();
    }, interval);
    console.log(`🔄 Polling every ${interval / 1000}s`);
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
    stopAlert,
    toggleMute,
    isMuted,
    isAlerting,
    needsClick,  // true = browser blocked autoplay, show hint to user
  };
}
