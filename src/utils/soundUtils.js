/**
 * Sound utility functions for notification audio
 * Handles cross-environment compatibility (dev/prod/Electron)
 */

/**
 * Get the correct sound file path based on environment
 */
export function getSoundPath(filename = 'new-order.mp3') {
  // In development with Vite, public folder is served from root
  // In production build, assets are in the build output
  // In Electron, we need to handle both scenarios
  
  const isDev = import.meta.env.DEV;
  const isElectron = window.electron?.isElectron;
  
  if (isDev) {
    // Development mode - Vite serves public folder from root
    return `/${filename}`;
  } else if (isElectron) {
    // Electron production - relative path from build
    return `./sounds/${filename}`;
  } else {
    // Web production build
    return `/sounds/${filename}`;
  }
}

/**
 * Test if a sound file can be loaded
 */
export async function testSoundFile(path) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(path);
    
    const timeout = setTimeout(() => {
      reject(new Error('Timeout loading audio'));
    }, 5000);
    
    audio.addEventListener('canplaythrough', () => {
      clearTimeout(timeout);
      resolve({
        success: true,
        path: audio.src,
        duration: audio.duration,
      });
    });
    
    audio.addEventListener('error', (e) => {
      clearTimeout(timeout);
      let errorMessage = 'Unknown error';
      
      if (audio.error) {
        switch(audio.error.code) {
          case audio.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Loading aborted';
            break;
          case audio.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error';
            break;
          case audio.error.MEDIA_ERR_DECODE:
            errorMessage = 'Decode error (file corrupted)';
            break;
          case audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'File not found or format not supported';
            break;
        }
      }
      
      reject(new Error(errorMessage));
    });
    
    // Start loading
    audio.load();
  });
}

/**
 * Create and configure an audio element for notifications
 */
export function createNotificationAudio(filename = 'new-order.mp3', volume = 0.7) {
  const soundPath = `/sounds/${filename}`;
  const audio = new Audio(soundPath);
  
  audio.volume = volume;
  audio.preload = 'auto';
  
  return audio;
}

/**
 * Play notification sound with fallback handling
 */
export async function playNotificationSound(audioRef) {
  if (!audioRef) {
    console.warn('Audio reference is null');
    return { success: false, error: 'Audio not initialized' };
  }
  
  try {
    // Reset to start
    audioRef.currentTime = 0;
    
    // Attempt to play
    await audioRef.play();
    
    return { success: true };
  } catch (error) {
    console.error('Failed to play sound:', error);
    
    let userMessage = 'Failed to play sound';
    
    if (error.name === 'NotAllowedError') {
      userMessage = 'Browser blocked autoplay. User interaction required first.';
    } else if (error.name === 'NotSupportedError') {
      userMessage = 'Audio format not supported';
    } else if (error.name === 'AbortError') {
      userMessage = 'Playback was aborted';
    }
    
    return { 
      success: false, 
      error: error.message,
      userMessage,
      errorType: error.name 
    };
  }
}
