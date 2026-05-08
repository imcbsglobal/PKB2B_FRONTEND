import React, { useState } from 'react';
import Button from '../components/Button';
import pkLogo from '../assets/pk.png';

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Login({ onLogin }) {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password)        e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
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

      {/* ── Dark branded left panel ─────────────────────── */}
      <aside className="login-panel">

        {/* Floating orbs */}
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />

        {/* Floating particles */}
        <div className="login-particle login-particle--1" />
        <div className="login-particle login-particle--2" />
        <div className="login-particle login-particle--3" />
        <div className="login-particle login-particle--4" />
        <div className="login-particle login-particle--5" />
        <div className="login-particle login-particle--6" />

        <div className="login-panel__inner">

          {/* Brand */}
          <div className="login-brand">
            <div className="login-brand__mark" aria-hidden="true">
              <img src={pkLogo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <span className="login-brand__name">PEEKAY</span>
          </div>

          {/* Headline */}
          <h1 className="login-headline">
            Order Collection<br />
            <span className="login-headline__accent">Made Simple.</span>
          </h1>

          {/* Description */}
          <p className="login-desc">
            Receive and manage incoming orders from your app —
            all in one focused workspace.
          </p>

          {/* Features */}
          <ul className="login-features" aria-label="Key features">
            {[
              'Real-time order notifications',
              'Track every order end-to-end',
              'Daily revenue at a glance',
            ].map(f => (
              <li key={f} className="login-feature">
                <span className="login-feature__dot" aria-hidden="true" />
                {f}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="login-stats">
            {[
              { value: '12k+',  label: 'Orders processed' },
              { value: '99.9%', label: 'Uptime'           },
              { value: '4.8 ★', label: 'User rating'      },
            ].map(s => (
              <div key={s.label} className="login-stat-card">
                <span className="login-stat__value">{s.value}</span>
                <span className="login-stat__label">{s.label}</span>
              </div>
            ))}
          </div>

        </div>
      </aside>

      {/* ── Right form panel ───────────────────────────── */}
      <main className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>

          <div className="login-card__header">
            <div className="login-card__logo" aria-label="Peekay">
              <img src={pkLogo} alt="Peekay" style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10 }} />
            </div>
            <h2 className="login-card__title">Welcome back</h2>
            <p className="login-card__sub">Sign in to your Peekay dashboard</p>
          </div>

          {errors.auth && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: '1.25rem' }}>
              {errors.auth}
            </div>
          )}

          <div className="login-form">

            {/* Username */}
            <div className="field">
              <label className="field__label">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={set('username')}
                className={`field__input${errors.username ? ' field__input--error' : ''}`}
                autoFocus
                autoComplete="username"
              />
              {errors.username && <span className="field__error">{errors.username}</span>}
            </div>

            {/* Password with eye toggle */}
            <div className="field">
              <label className="field__label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={set('password')}
                  className={`field__input${errors.password ? ' field__input--error' : ''}`}
                  style={{ width: '100%', paddingRight: '2.75rem', boxSizing: 'border-box' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    color: 'var(--color-muted-fg)',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1,
                  }}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            {/* Remember me */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-muted-fg)',
              marginTop: '-0.25rem',
            }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{
                  width: '15px',
                  height: '15px',
                  accentColor: 'var(--color-primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              Remember me
            </label>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign in
            </Button>

          </div>

          <p className="login-hint">
            Demo: <code>admin</code> / <code>admin123</code>
          </p>

        </form>
      </main>
    </div>
  );
}