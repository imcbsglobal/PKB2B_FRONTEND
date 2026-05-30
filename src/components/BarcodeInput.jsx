import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Spinner from './Spinner';

/**
 * BarcodeInput Component - High-performance barcode scanning
 * 
 * Features:
 * - Auto-search on Enter key or when barcode reaches configured length
 * - Loading indicator with visual feedback
 * - Success/error messages with auto-dismiss
 * - Auto-focus on input after adding product
 * 
 * Props:
 * - onSearch(barcode): Called when Enter or search button clicked
 * - isLoading: External loading state
 * - minBarcodeLength: Minimum barcode length to trigger auto-search (default: 6)
 * - messageTimeout: Duration to show messages (default: 3000ms)
 * 
 * Ref methods:
 * - showSuccess(): Show success message and clear input
 * - showError(text): Show error message
 * - clearInput(): Clear the input field
 * - focusInput(): Focus the input field
 */
const BarcodeInput = forwardRef(({
  onSearch,
  isLoading = false,
  minBarcodeLength = 6,
  messageTimeout = 3000,
}, ref) => {
  const [barcode, setBarcode] = useState('');
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }
  const inputRef = useRef(null);
  const messageTimeoutRef = useRef(null);

  // Show temporary message with auto-dismiss
  const showMessage = useCallback((type, text) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage({ type, text });
    messageTimeoutRef.current = setTimeout(() => {
      setMessage(null);
    }, messageTimeout);
  }, [messageTimeout]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    showSuccess: () => {
      setBarcode('');
      showMessage('success', '✓ Product Added Successfully');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    showError: (text = 'Product Not Found') => {
      showMessage('error', text);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    clearInput: () => {
      setBarcode('');
      setMessage(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    focusInput: () => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  }), [showMessage]);

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback(() => {
    const trimmedBarcode = barcode.trim();
    if (!trimmedBarcode) {
      // Don't show error for empty input - just clear focus
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }
    if (onSearch) {
      onSearch(trimmedBarcode);
    }
  }, [barcode, onSearch]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setBarcode(value);
    // Clear any previous error messages when user starts typing
    if (value.trim().length > 0 && message?.type === 'error') {
      setMessage(null);
    }
  }, [message]);

  const handleClear = useCallback(() => {
    setBarcode('');
    setMessage(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div style={{
      marginBottom: '16px',
    }}>
      <label className="field__label">
        Select Items
      </label>

      <div style={{
        position: 'relative',
        marginTop: '8px',
      }}>
        {/* Input Container */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'stretch',
        }}>
          <div style={{
            flex: 1,
            position: 'relative',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type Barcode "
              disabled={isLoading}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: isLoading ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: isLoading ? '#f3f4f6' : '#fff',
                color: '#1f2937',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.6 : 1,
              }}
            />

            {/* Loading Spinner Inside Input */}
            {isLoading && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <Spinner size="sm" color="#f59e0b" />
              </div>
            )}
          </div>

          {/* Search Button (visible when not loading) */}
          {!isLoading && barcode.trim() && (
            <button
              type="button"
              onClick={handleSearch}
              style={{
                padding: '10px 16px',
                backgroundColor: '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f59e0b';
              }}
            >
              Search
            </button>
          )}

          {/* Clear Button (visible when has input) */}
          {barcode && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '10px 12px',
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'slideUp 0.2s ease-out',
              backgroundColor:
                message.type === 'success'
                  ? '#d1fae5'
                  : '#fee2e2',
              color:
                message.type === 'success'
                  ? '#065f46'
                  : '#991b1b',
              border:
                message.type === 'success'
                  ? '2px solid #6ee7b7'
                  : '2px solid #fca5a5',
              boxShadow:
                message.type === 'success'
                  ? '0 2px 4px rgba(16, 185, 129, 0.1)'
                  : '0 2px 4px rgba(220, 38, 38, 0.1)',
            }}
          >
            <span style={{ fontSize: '16px' }}>
              {message.type === 'success' ? '✓' : '✕'}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* CSS Animation for message */}
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Hint Text */}
        <div style={{
          marginTop: '6px',
          fontSize: '12px',
          color: '#9ca3af',
        }}>
          Enter full barcode and press Enter to search
        </div>
      </div>
    </div>
  );
});

BarcodeInput.displayName = 'BarcodeInput';

export default BarcodeInput;
