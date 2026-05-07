// ============================================================
// PEEKAY — main.jsx
// Wire global styles + ThemeProvider once here.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Global styles FIRST — design tokens, reset, typography
import './styles/global.css';

import App from './App';
import { ThemeProvider } from './context/ThemeContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);