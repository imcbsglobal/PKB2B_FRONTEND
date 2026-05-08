import React, { useState, useRef } from 'react';

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Arjun Menon',    email: 'arjun@example.com',    avatar: 'AM' },
  { id: 2, name: 'Priya Nair',     email: 'priya@example.com',    avatar: 'PN' },
  { id: 3, name: 'Rahul Das',      email: 'rahul@example.com',    avatar: 'RD' },
  { id: 4, name: 'Sneha Thomas',   email: 'sneha@example.com',    avatar: 'ST' },
  { id: 5, name: 'Vijay Kumar',    email: 'vijay@example.com',    avatar: 'VK' },
  { id: 6, name: 'Meera Pillai',   email: 'meera@example.com',    avatar: 'MP' },
];

export default function Notification() {
  const [title, setTitle]               = useState('');
  const [message, setMessage]           = useState('');
  const [image, setImage]               = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus]             = useState(null);
  const [sendToAll, setSendToAll]       = useState(true);
  const [selectedIds, setSelectedIds]   = useState([]);
  const [history, setHistory]           = useState([]);
  const fileInputRef = useRef(null);

  /* image */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const removeImage = () => {
    setImage(null); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* customer */
  const toggleCustomer = (id) =>
    setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleSelectAll = () =>
    setSelectedIds(selectedIds.length === MOCK_CUSTOMERS.length ? [] : MOCK_CUSTOMERS.map((c) => c.id));

  /* send */
  const isValid = title.trim() && message.trim() && (sendToAll || selectedIds.length > 0);

  const handleSend = async () => {
    if (!isValid) return;
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 1400));

    const recipients = sendToAll
      ? MOCK_CUSTOMERS
      : MOCK_CUSTOMERS.filter((c) => selectedIds.includes(c.id));

    setHistory((prev) => [{
      id: Date.now(), title, message, imagePreview,
      sentAt: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      recipients: sendToAll ? 'All Customers' : `${recipients.length} customer${recipients.length !== 1 ? 's' : ''}`,
      recipientNames: sendToAll ? null : recipients.map((r) => r.name),
      recipientCount: sendToAll ? MOCK_CUSTOMERS.length : recipients.length,
    }, ...prev]);

    setStatus('sent');
    setTimeout(() => {
      setTitle(''); setMessage(''); setSelectedIds([]);
      setSendToAll(true); removeImage(); setStatus(null);
    }, 1800);
  };

  /* style helpers */
  const card = {
    background: 'var(--color-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-sm)',
  };
  const toggleTrack = (on) => ({
    position: 'relative', width: 44, height: 24,
    borderRadius: 'var(--radius-full)',
    background: on ? 'var(--color-primary)' : 'var(--color-border)',
    border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0,
    transition: 'background 200ms',
  });
  const toggleThumb = (on) => ({
    position: 'absolute', top: 3, left: on ? 23 : 3,
    width: 18, height: 18, borderRadius: '50%',
    background: on ? 'oklch(0.24 0.012 250)' : '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,.2)',
    transition: 'left 200ms',
  });

  return (
    <div className="page" style={{ minHeight: '100%' }}>

      {/* ── Page header ── */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="page__title">Send Notification</h1>
        <p className="page__sub">Compose and broadcast messages to your customers.</p>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '420px 1fr',
        gap: 'var(--space-6)',
        alignItems: 'start',
      }}>

        {/* ══════════ LEFT — Compose Form ══════════ */}
        <div style={{ ...card, padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🔔</div>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-fg)' }}>Compose Message</span>
          </div>

          {/* Success banner */}
          {status === 'sent' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 'var(--radius)', padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: '#15803d' }}>
              <span>✅</span> Notification sent successfully!
            </div>
          )}

          {/* Title */}
          <div className="field">
            <label className="field__label" htmlFor="notif-title">
              Notification Title <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <input
              id="notif-title" className="field__input" type="text"
              placeholder="e.g. New offer available!"
              value={title} onChange={(e) => setTitle(e.target.value)}
              maxLength={80} disabled={!!status}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', textAlign: 'right' }}>{title.length}/80</span>
          </div>

          {/* Message */}
          <div className="field">
            <label className="field__label" htmlFor="notif-message">
              Message <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <textarea
              id="notif-message" className="field__input"
              placeholder="Write your notification message here…"
              value={message} onChange={(e) => setMessage(e.target.value)}
              rows={3} maxLength={300} disabled={!!status}
              style={{ resize: 'vertical', minHeight: 80 }}
            />
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', textAlign: 'right' }}>{message.length}/300</span>
          </div>

          {/* Image */}
          <div className="field">
            <label className="field__label">Image (optional)</label>
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', display: 'block' }} />
                <button onClick={removeImage} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 'var(--radius-full)', background: 'oklch(0.24 0.012 250 / 0.8)', border: 'none', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                <div style={{ padding: '4px var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', background: 'var(--color-secondary)', borderTop: '1px solid var(--color-border)' }}>{image?.name}</div>
              </div>
            ) : (
              <label htmlFor="notif-image"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', padding: 'var(--space-5)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius)', background: 'var(--color-secondary)', cursor: 'pointer', transition: 'border-color 200ms, background 200ms' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-secondary)'; }}
              >
                <span style={{ fontSize: '1.25rem' }}>🖼️</span>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)' }}>Click to upload image</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>PNG, JPG, WEBP — max 5 MB</span>
                <input id="notif-image" ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* ── Send To ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <span className="field__label">Send To</span>

            {/* All customers toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: sendToAll ? 'var(--color-accent)' : 'var(--color-secondary)', border: `1px solid ${sendToAll ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius)', transition: 'all 200ms' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '1rem' }}>👥</span>
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)' }}>All Customers</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>{MOCK_CUSTOMERS.length} customers</div>
                </div>
              </div>
              <button style={toggleTrack(sendToAll)} onClick={() => { setSendToAll(!sendToAll); setSelectedIds([]); }} aria-label="Toggle all customers">
                <span style={toggleThumb(sendToAll)} />
              </button>
            </div>

            {/* Individual list */}
            {!sendToAll && (
              <div style={{ ...card, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-secondary)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {selectedIds.length}/{MOCK_CUSTOMERS.length} selected
                  </span>
                  <button onClick={toggleSelectAll} style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', color: 'oklch(0.55 0.15 80)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {selectedIds.length === MOCK_CUSTOMERS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                {MOCK_CUSTOMERS.map((c, i) => {
                  const sel = selectedIds.includes(c.id);
                  return (
                    <div key={c.id} onClick={() => toggleCustomer(c.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderBottom: i < MOCK_CUSTOMERS.length - 1 ? '1px solid var(--color-border)' : 'none', background: sel ? 'var(--color-accent)' : 'transparent', cursor: 'pointer', transition: 'background 150ms' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 'var(--radius-full)', background: sel ? 'var(--color-primary)' : 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'var(--weight-bold)', color: sel ? 'oklch(0.24 0.012 250)' : 'var(--color-muted-fg)', transition: 'all 200ms', flexShrink: 0 }}>{c.avatar}</div>
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)' }}>{c.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>{c.email}</div>
                        </div>
                      </div>
                      <div style={{ width: 18, height: 18, borderRadius: 4, border: sel ? '2px solid var(--color-primary)' : '2px solid var(--color-border)', background: sel ? 'var(--color-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms', flexShrink: 0 }}>
                        {sel && <span style={{ color: 'oklch(0.24 0.012 250)', fontSize: '0.65rem', fontWeight: 'bold' }}>✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleSend}
            disabled={!isValid || !!status}
          >
            {status === 'sending' ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid oklch(0.24 0.012 250 / 0.3)', borderTopColor: 'oklch(0.24 0.012 250)', borderRadius: '50%', display: 'inline-block', animation: 'pk-spin 0.7s linear infinite' }} />
                Sending…
              </>
            ) : status === 'sent' ? '✅ Sent!' : <><span>🔔</span> Send Notification</>}
          </button>
        </div>

        {/* ══════════ RIGHT — History Table ══════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📋</div>
              <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-fg)' }}>Notification History</span>
              {history.length > 0 && (
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{history.length}</span>
              )}
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>Most recent first</span>
          </div>

          {/* Table card */}
          <div className="table-wrap">
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-5)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>📭</div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)', marginBottom: 'var(--space-2)' }}>No notifications yet</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-fg)' }}>
                  Sent notifications will appear here as a table.
                </div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Image</th>
                    <th>Sent To</th>
                    <th>Recipients</th>
                    <th>Date &amp; Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, idx) => (
                    <tr key={item.id}>
                      {/* # */}
                      <td style={{ color: 'var(--color-muted-fg)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)' }}>
                        {idx + 1}
                      </td>

                      {/* Title */}
                      <td>
                        <div style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.title}
                        </div>
                      </td>

                      {/* Message */}
                      <td>
                        <div style={{ color: 'var(--color-muted-fg)', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'var(--text-sm)' }}>
                          {item.message}
                        </div>
                      </td>

                      {/* Image thumbnail */}
                      <td>
                        {item.imagePreview ? (
                          <img
                            src={item.imagePreview} alt="thumb"
                            style={{ width: 44, height: 36, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', display: 'block' }}
                          />
                        ) : (
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', background: 'var(--color-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>—</span>
                        )}
                      </td>

                      {/* Sent To */}
                      <td>
                        <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--color-fg)', fontSize: 'var(--text-sm)' }}>
                          {item.recipients}
                        </span>
                        {item.recipientNames && (
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', marginTop: 2, maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.recipientNames.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* Recipient count */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-full)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'var(--weight-bold)', color: 'oklch(0.55 0.15 80)' }}>
                            {item.recipientCount}
                          </div>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)', whiteSpace: 'nowrap' }}>
                          {item.sentAt}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="badge badge-success">Sent</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes pk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}