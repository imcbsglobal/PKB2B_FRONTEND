import React, { useState, useEffect, lazy, Suspense } from 'react';
import Orders from './pages/Orders';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { authAPI } from './Services/api';

const Login = lazy(() => import('./pages/Login'));

/**
 * Simplified Orders-Only App for Electron Desktop
 * Shows login page, then Orders page (no sidebar)
 */
function OrdersApp() {
  const [user, setUser] = useState(null);
  const { toasts, showToast, hideToast } = useToast();

  // Restore user session from localStorage on app startup
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    const accessToken = localStorage.getItem('access_token');
    
    if (userId && userRole && accessToken) {
      setUser({ name: userId, role: userRole });
      console.log('✅ User session restored:', userId);
    }
  }, []);

  // If not logged in, show login page
  if (!user) {
    return (
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>}>
        <Login onLogin={setUser} />
      </Suspense>
    );
  }

  // If logged in, show Orders page with logout button
  return (
    <div className="app" style={{ padding: 0, margin: 0 }}>
      {/* Logout button in top-right */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 10000,
      }}>
        <button
          onClick={() => {
            authAPI.logout();
            setUser(null);
            showToast('Logged out successfully', 'info');
          }}
          style={{
            padding: '8px 16px',
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>

      {/* Orders Page - Full Screen */}
      <Orders showToast={showToast} />

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default OrdersApp;
