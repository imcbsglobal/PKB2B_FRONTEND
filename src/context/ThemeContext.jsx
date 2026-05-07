// ============================================================
// PEEKAY — ThemeContext
// Wrap your app with <ThemeProvider> in main.jsx.
// Access: const { theme } = useTheme();  (reserved for future dark mode)
// ============================================================

import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({ theme: 'light' });

export function ThemeProvider({ children }) {
  // Extend here when you add dark mode support
  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}