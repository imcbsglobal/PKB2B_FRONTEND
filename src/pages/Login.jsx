// ============================================================
// PEEKAY — src/pages/Login.jsx  (light theme, v2)
// ============================================================

import React, { useState } from 'react';
import { Button, Input } from '../components/ui';
import '../styles/global.css';

export default function Login({ onLogin }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password)        e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    if (form.username === 'admin' && form.password === 'admin123') {
      onLogin({ name: 'Admin', role: 'Order Manager' });
    } else {
      setErrors({ auth: 'Invalid credentials. Try admin / admin123' });
    }
  };

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: undefined, auth: undefined }));
  };

  return (
    <div className="login-root">

      {/* ── Left panel ─────────────────────────────────── */}
      <aside className="login-left">

        <div className="login-left__inner">

          <div className="brand-mark">
            {/* Inline SVG recreation of the Peekay logo icon */}
            <div className="brand-logo-icon" aria-hidden="true">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="10" fill="#F5A623"/>
                {/* Double chevron left — mirroring the logo mark */}
                <path d="M30 12 L18 24 L30 36" stroke="#3D3F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12 L10 24 L22 36" stroke="#3D3F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand-name">PEEKAY</span>
          </div>

          <div className="brand-tagline">
            <h1>
              Order Collection<br />
              <span className="brand-tagline__accent">Made Simple.</span>
            </h1>
            <p>
              Receive and manage incoming orders from your app —
              all in one focused workspace.
            </p>
          </div>

          <ul className="features">
            <li className="feature">
              <span className="feature__dot" aria-hidden="true" />
              Real-time order notifications
            </li>
            <li className="feature">
              <span className="feature__dot" aria-hidden="true" />
              Track every order end-to-end
            </li>
            <li className="feature">
              <span className="feature__dot" aria-hidden="true" />
              Daily revenue at a glance
            </li>
          </ul>

          <div className="login-stats">
            <div className="stat">
              <span>12k+</span>
              <label>Orders processed</label>
            </div>
            <div className="stat">
              <span>99.9%</span>
              <label>Uptime</label>
            </div>
            <div className="stat">
              <span>4.8 ★</span>
              <label>User rating</label>
            </div>
          </div>

        </div>
      </aside>

      {/* ── Right panel (form) ─────────────────────────── */}
      <main className="login-right">

        <form className="login-card" onSubmit={handleSubmit} noValidate>

          <div className="login-header">
            <div className="login-header__logo" aria-label="Peekay">
              <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="10" fill="#F5A623"/>
                <path d="M30 12 L18 24 L30 36" stroke="#3D3F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12 L10 24 L22 36" stroke="#3D3F44" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your Peekay dashboard</p>
          </div>

          {errors.auth && (
            <div className="error-msg" role="alert">
              {errors.auth}
            </div>
          )}

          <Input
            label="Username"
            type="text"
            placeholder="Enter your username"
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoFocus
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            Sign in
          </Button>

          <p className="hint">
            Demo: <code>admin</code> / <code>admin123</code>
          </p>

        </form>
      </main>
    </div>
  );
}