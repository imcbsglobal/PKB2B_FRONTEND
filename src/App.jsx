import { useState } from 'react';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sidebar from './layout/Sidebar';

export default function App() {
  const [user, setUser] = useState(null);

  return user
    ? <Dashboard user={user} onLogout={() => setUser(null)} />
    : <Login onLogin={setUser} />;
}