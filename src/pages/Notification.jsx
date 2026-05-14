import React, { useState, useRef } from 'react';

export default function Notification() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const fileInputRef = useRef(null);

  /* image */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* send */
  const isValid = title.trim() && message.trim();

  const handleSend = async () => {
    if (!isValid) return;
    setStatus('sending');
    await new Promise((r) => setTimeout(r, 1400));

    setHistory((prev) => [
      {
        id: Date.now(),
        title,
        message,
        imagePreview,
        sentAt: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        recipientCount: 'All app users',
      },
      ...prev,
    ]);

    setStatus('sent');
    setTimeout(() => {
      setTitle('');
      setMessage('');
      removeImage();
      setStatus(null);
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
    <div className="page notification-page">
      {/* ── Two-column layout: Compose + Preview ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {/* ══════════ LEFT — Compose Form ══════════ */}
        <div
          style={{
            background: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-5)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-fg)' }}>
              Compose new notification
            </span>
          </div>

          {/* Success message */}
          {status === 'sent' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                color: '#15803d',
              }}
            >
              <span>✅</span> Notification sent successfully!
            </div>
          )}

          {/* Title */}
          <div className="field">
            <label className="field__label" htmlFor="notif-title">
              Title <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <input
              id="notif-title"
              className="field__input"
              type="text"
              placeholder="e.g. Weekend Sale Live!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              disabled={!!status}
            />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-muted-fg)',
                textAlign: 'right',
              }}
            >
              {title.length}/80
            </span>
          </div>

          {/* Message */}
          <div className="field">
            <label className="field__label" htmlFor="notif-message">
              Message <span style={{ color: 'var(--color-destructive)' }}>*</span>
            </label>
            <textarea
              id="notif-message"
              className="field__input"
              placeholder="Short, clear and action-oriented."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={300}
              disabled={!!status}
              style={{ resize: 'vertical', minHeight: 100 }}
            />
            <span
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-muted-fg)',
                textAlign: 'right',
              }}
            >
              {message.length}/300
            </span>
          </div>

          {/* Image Upload */}
          <div className="field">
            <label className="field__label">Image (optional)</label>
            {imagePreview ? (
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: '100%',
                    maxHeight: 120,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
                <button
                  onClick={removeImage}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 24,
                    height: 24,
                    borderRadius: 'var(--radius-full)',
                    background: 'oklch(0.24 0.012 250 / 0.8)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
                <div
                  style={{
                    padding: '4px var(--space-3)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-muted-fg)',
                    background: 'var(--color-secondary)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  {image?.name}
                </div>
              </div>
            ) : (
              <label
                htmlFor="notif-image"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-5)',
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--radius)',
                  background: 'var(--color-secondary)',
                  cursor: 'pointer',
                  transition: 'border-color 200ms, background 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.background = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.background = 'var(--color-secondary)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🖼️</span>
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-fg)',
                  }}
                >
                  Click to upload image
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>
                  PNG, JPG, WEBP — max 5 MB
                </span>
                <input
                  id="notif-image"
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Audience Info */}
          <div
            style={{
              background: 'var(--color-accent)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-3) var(--space-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <span>👥</span>
            <div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-fg)',
                }}
              >
                Audience
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted-fg)' }}>
                All app users
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              className="btn btn-secondary btn-lg"
              style={{ flex: 1 }}
              onClick={() => {
                setTitle('');
                setMessage('');
                removeImage();
              }}
              disabled={!!status}
            >
              Save draft
            </button>
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleSend}
              disabled={!isValid || !!status}
            >
              {status === 'sending' ? (
                <>
                  <span
                    style={{
                      width: 16,
                      height: 16,
                      border: '2px solid oklch(0.24 0.012 250 / 0.3)',
                      borderTopColor: 'oklch(0.24 0.012 250)',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'pk-spin 0.7s linear infinite',
                      marginRight: '4px',
                    }}
                  />
                  Sending…
                </>
              ) : status === 'sent' ? (
                '✅ Sent!'
              ) : (
                <>
                  <span style={{ marginRight: '6px' }}>🔔</span> Send now
                </>
              )}
            </button>
          </div>
        </div>

        {/* ══════════ RIGHT — Live Preview ══════════ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              color: 'var(--color-muted-fg)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            📱 Live preview
          </div>
          <div
            style={{
              width: '100%',
              aspectRatio: '9/16',
              background: '#1a1a1a',
              borderRadius: '32px',
              border: '6px solid #222',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--space-4)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Notch */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '40%',
                height: 24,
                background: '#000',
                borderRadius: '0 0 24px 24px',
                zIndex: 10,
              }}
            />

            {/* Time */}
            <div
              style={{
                position: 'absolute',
                top: 32,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontSize: '0.7rem',
                color: '#999',
                fontWeight: 600,
              }}
            >
              9:41
            </div>

            {/* Notification card */}
            <div
              style={{
                marginTop: 'auto',
                background: '#fff',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)',
                maxWidth: '90%',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: '0.9rem' }}>📦</span>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: 'var(--color-muted-fg)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    PEEAKY · NOW
                  </div>
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  minHeight: '1.2em',
                }}
              >
                {title || 'Your notification title'}
              </div>

              {/* Message */}
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  lineHeight: 1.4,
                  minHeight: '2.4em',
                }}
              >
                {message || 'The message body will preview here as you type.'}
              </div>

              {/* Image preview in card */}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Notification"
                  style={{
                    width: '100%',
                    maxHeight: 80,
                    objectFit: 'cover',
                    borderRadius: 'var(--radius)',
                  }}
                />
              )}
            </div>

            {/* Bottom area */}
            <div style={{ marginTop: 'auto', height: 60 }} />
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM — Sent History ══════════ */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', color: 'var(--color-fg)' }}>
            Sent history
          </span>
          {history.length > 0 && (
            <span
              className="badge badge-primary"
              style={{ fontSize: '0.7rem' }}
            >
              {history.length}
            </span>
          )}
        </div>

        {history.length === 0 ? (
          <div
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              padding: 'var(--space-12) var(--space-5)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>📭</div>
            <div
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-fg)',
                marginBottom: 'var(--space-2)',
              }}
            >
              No notifications sent yet
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted-fg)' }}>
              Sent notifications will appear here.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {history.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🔔</span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-fg)',
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-muted-fg)',
                        marginTop: '2px',
                      }}
                    >
                      {item.sentAt}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-muted-fg)',
                    lineHeight: 1.4,
                  }}
                >
                  {item.message}
                </div>

                {/* Image if present */}
                {item.imagePreview && (
                  <img
                    src={item.imagePreview}
                    alt="Notification"
                    style={{
                      width: '100%',
                      maxHeight: 120,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                )}

                {/* Recipients */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>👥</span>
                  <span
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-muted-fg)',
                    }}
                  >
                    {item.recipientCount}
                  </span>
                  <span
                    className="badge badge-success"
                    style={{ fontSize: '0.65rem', marginLeft: 'auto' }}
                  >
                    Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes pk-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}