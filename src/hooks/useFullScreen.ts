"use client";

import { useState, useEffect, useCallback } from 'react';

const useFullScreen = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const enterFullScreen = useCallback(() => {
    if (typeof document !== 'undefined' && document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }, []);
  
  const exitFullScreen = useCallback(() => {
    if (typeof document !== 'undefined' && document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);
  
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);
  
  return { isFullScreen, enterFullScreen, exitFullScreen };
};

export default useFullScreen;