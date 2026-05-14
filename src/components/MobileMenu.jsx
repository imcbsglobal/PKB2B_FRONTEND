import React, { useState } from 'react';

export default function MobileMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 10000,
          background: 'var(--color-primary)',
          border: 'none',
          borderRadius: '8px',
          width: '44px',
          height: '44px',
          display: 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          cursor: 'pointer',
          boxShadow: 'none',
        }}
        className="mobile-menu-toggle"
      >
        <span style={{
          width: '20px',
          height: '2px',
          background: '#fff',
          borderRadius: '2px',
          transition: 'transform 0.3s, opacity 0.3s',
          transform: isOpen ? 'rotate(45deg) translateY(7px)' : 'none',
        }} />
        <span style={{
          width: '20px',
          height: '2px',
          background: '#fff',
          borderRadius: '2px',
          transition: 'opacity 0.3s',
          opacity: isOpen ? 0 : 1,
        }} />
        <span style={{
          width: '20px',
          height: '2px',
          background: '#fff',
          borderRadius: '2px',
          transition: 'transform 0.3s',
          transform: isOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
        }} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'oklch(0.22 0.012 256 / 0.5)',
            zIndex: 9998,
            animation: 'fadeIn 0.3s',
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-280px',
          width: '280px',
          height: '100vh',
          background: 'var(--color-card)',
          borderRight: '1px solid var(--color-border)',
          zIndex: 9999,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
        className="mobile-sidebar"
      >
        {children}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
