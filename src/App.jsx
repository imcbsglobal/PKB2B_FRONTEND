// src/App.jsx
import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import FavoriteCategories from './pages/FavoriteCategories';

import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Sidebar from './components/Sidebar';
import Notification from './pages/Notification';
import Item from './pages/Item';
import Brand from './pages/Brand';
import Inventory from './pages/Inventory';
import Banner from './pages/Banner';
import Banneradd from './pages/Banneradd';
import { authAPI } from './Services/api';

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

  // Restore user session from localStorage on app startup
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    if (userId && userRole) {
      setUser({ name: userId, role: userRole });
    }
  }, []);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const PageComponent = PAGES[currentPage] ?? Dashboard;

  const handleNavigate = (page, banner = null) => {
    setCurrentPage(page);
    setBannerToEdit(banner || null);
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
        <PageComponent
          onNavigate={handleNavigate}
          onBannerAdded={handleBannerSaved}
          onCancel={() => handleNavigate('banner')}
          bannerToEdit={bannerToEdit}
          refreshTrigger={refreshTrigger}
        />
      </main>
    </div>
  );
}