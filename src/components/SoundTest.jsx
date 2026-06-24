import React, { useRef, useState } from 'react';

/**
 * Sound Test Component
 * Add this temporarily to any page to test notification sound
 */
export default function SoundTest() {
  const audioRef = useRef(null);
  const [status, setStatus] = useState('Not loaded');
  const [error, setError] = useState(null);

  const loadSound = () => {
    try {
      // Direct path - Vite serves public folder files from root
      const soundPath = '/sounds/new-order.mp3';
      
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = 1.0; // Full volume for testing
      audioRef.current.preload = 'auto';
      
      console.log('🔊 Loading sound from:', soundPath);
      console.log('🔊 Full src will be:', window.location.origin + soundPath);
      
      audioRef.current.addEventListener('canplaythrough', () => {
        setStatus('✅ Sound loaded successfully');
        setError(null);
        console.log('✅ Sound loaded successfully');
        console.log('✅ Audio src:', audioRef.current.src);
        console.log('✅ Audio duration:', audioRef.current.duration, 'seconds');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        const target = e.target;
        let errorMsg = 'Failed to load audio file';
        
        if (target.error) {
          switch(target.error.code) {
            case 1: errorMsg = 'Loading aborted'; break;
            case 2: errorMsg = 'Network error - check file exists'; break;
            case 3: errorMsg = 'Decode error - file corrupted'; break;
            case 4: errorMsg = 'File not found or format not supported'; break;
          }
        }
        
        setStatus('❌ Failed to load');
        setError(errorMsg + ' - Check: public/sounds/new-order.mp3');
        console.error('❌ Sound error:', errorMsg);
        console.error('❌ Attempted URL:', audioRef.current?.src);
      });

      setStatus('⏳ Loading...');
    } catch (err) {
      setStatus('❌ Error');
      setError(err.message);
      console.error('❌ Exception:', err);
    }
  };

  const playSound = async () => {
    if (!audioRef.current) {
      setStatus('⏳ Loading first...');
      loadSound();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!audioRef.current) {
      setStatus('❌ Audio not initialized');
      setError('Audio ref is null after loading');
      return;
    }

    try {
      setStatus('🔊 Playing...');
      console.log('🔊 Attempting to play...');
      console.log('🔊 Ready state:', audioRef.current.readyState);
      console.log('🔊 Network state:', audioRef.current.networkState);
      
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      
      setStatus('✅ Sound played successfully! 🎉');
      console.log('✅ Sound played successfully!');
    } catch (err) {
      setStatus('❌ Play failed');
      console.error('❌ Play failed:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('🔒 Browser blocked autoplay. Click Load first, wait 2 seconds, then Play.');
      } else if (err.name === 'NotSupportedError') {
        setError('❌ Audio format not supported. Try a different MP3 file.');
      } else {
        setError(`❌ ${err.name}: ${err.message}`);
      }
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setStatus('⏹️ Stopped');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #333',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      minWidth: '320px',
      maxWidth: '400px',
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔊 Sound Test
      </h3>
      
      <div style={{ 
        marginBottom: '10px', 
        padding: '8px', 
        background: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '12px',
        wordBreak: 'break-word',
      }}>
        <strong>Status:</strong> {status}
        {error && (
          <div style={{ color: 'red', marginTop: '5px', fontSize: '11px' }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
        <button
          onClick={loadSound}
          style={{
            padding: '8px 12px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          1. Load Sound
        </button>

        <button
          onClick={playSound}
          style={{
            padding: '8px 12px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          2. Play Sound
        </button>

        <button
          onClick={stopSound}
          style={{
            padding: '8px 12px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Stop
        </button>
      </div>

      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#666',
        borderTop: '1px solid #ddd',
        paddingTop: '8px',
      }}>
        <strong>File:</strong> /sounds/new-order.mp3
        <br />
        <strong>Instructions:</strong>
        <ol style={{ margin: '5px 0', paddingLeft: '15px' }}>
          <li>Click "Load Sound" and wait</li>
          <li>Click "Play Sound"</li>
          <li>Check console (F12) for details</li>
        </ol>
      </div>
    </div>
  );
}
