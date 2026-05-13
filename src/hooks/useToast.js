import { useState, useCallback } from 'react';

let globalShowToast = null;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Expose globally
  if (!globalShowToast) {
    globalShowToast = showToast;
  }

  return { toasts, showToast, hideToast };
}

// Global toast function for use anywhere
export const toast = {
  success: (msg) => globalShowToast?.(msg, 'success'),
  error: (msg) => globalShowToast?.(msg, 'error'),
  warning: (msg) => globalShowToast?.(msg, 'warning'),
  info: (msg) => globalShowToast?.(msg, 'info'),
};
