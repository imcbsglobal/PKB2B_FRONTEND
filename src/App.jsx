import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import Sidebar from './components/Sidebar';
import Notification from './pages/Notification';

const PAGES = {
  dashboard: Dashboard,
  products:  Products,
  customers: Customers,
  orders:    Orders,
  notifications: Notification,
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const PageComponent = PAGES[currentPage] ?? Dashboard;

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        user={user}
        onLogout={() => setUser(null)}
      />
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}