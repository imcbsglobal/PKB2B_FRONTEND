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
      {/* Orders Page - Full Screen (logout passed as prop) */}
      <Orders showToast={showToast} onLogout={() => {
        authAPI.logout();
        setUser(null);
        showToast('Logged out successfully', 'info');
      }} />

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
