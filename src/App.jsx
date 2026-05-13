// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import { useToast } from './hooks/useToast';
import { authAPI } from './Services/api';

const Dashboard          = lazy(() => import('./pages/Dashboard'));
const Categories         = lazy(() => import('./pages/Categories'));
const FavoriteCategories = lazy(() => import('./pages/FavoriteCategories'));
const Customers          = lazy(() => import('./pages/Customers'));
const Orders             = lazy(() => import('./pages/Orders'));
const Notification       = lazy(() => import('./pages/Notification'));
const Item               = lazy(() => import('./pages/Item'));
const Brand              = lazy(() => import('./pages/Brand'));
const Inventory          = lazy(() => import('./pages/Inventory'));
const Banner             = lazy(() => import('./pages/Banner'));
const Banneradd          = lazy(() => import('./pages/Banneradd'));
const Login              = lazy(() => import('./pages/Login'));

const PAGES = {
  dashboard:           Dashboard,
  categories:          Categories,
  favoriteCategories:  FavoriteCategories,
  customers:           Customers,
  orders:              Orders,
  notifications:       Notification,
  item:                Item,
  brands:              Brand,
  banner:              Banner,
  banneradd:           Banneradd,
  inventory:           Inventory,
};

export default function App() {
  const [user, setUser]               = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [bannerToEdit, setBannerToEdit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toasts, showToast, hideToast } = useToast();

  // Restore user session and current page from localStorage on app startup
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    if (userId && userRole) {
      setUser({ name: userId, role: userRole });
      
      // Restore the current page from localStorage (only if it was previously saved)
      // On fresh login, start with dashboard
      const savedPage = localStorage.getItem('current_page');
      if (savedPage && PAGES[savedPage]) {
        setCurrentPage(savedPage);
      } else {
        // Default to dashboard on fresh login
        setCurrentPage('dashboard');
        localStorage.setItem('current_page', 'dashboard');
      }
    }
  }, []);

  if (!user) {
    return (
      <Suspense fallback={null}>
        <Login onLogin={setUser} />
      </Suspense>
    );
  }

  const PageComponent = PAGES[currentPage] ?? Dashboard;

  const handleNavigate = (page, banner = null) => {
    setCurrentPage(page);
    setBannerToEdit(banner || null);
    // Save current page to localStorage for persistence on refresh
    localStorage.setItem('current_page', page);
  };

  const handleBannerSaved = () => {
    setRefreshTrigger(prev => prev + 1);
    handleNavigate('banner');
  };

  const handleLogout = () => {
    authAPI.logout(); // Clear localStorage
    setUser(null);     // Clear user state
  };

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>Loading...</div>}>
          <PageComponent
            onNavigate={handleNavigate}
            onBannerAdded={handleBannerSaved}
            onCancel={() => handleNavigate('banner')}
            bannerToEdit={bannerToEdit}
            refreshTrigger={refreshTrigger}
            showToast={showToast}
          />
        </Suspense>
      </main>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} duration={t.duration} onClose={() => hideToast(t.id)} />
      ))}
    </div>
  );
}