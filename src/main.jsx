import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import OrdersApp from './OrdersApp';

// Check if running in Electron
const isElectron = window.electron?.isElectron;

// Use OrdersApp for Electron, full App for web
const AppToRender = isElectron ? OrdersApp : App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppToRender />
  </React.StrictMode>,
);