/**
 * Input — PEEKAY component
 * Professional text input with labels, errors, and validation states
 * Uses .field, .field__label, .field__input, .field__error from components.css
 */
export default function Input({
  label,
  type = 'text',
  placeholder = '',
  value = '',
  onChange = () => {},
  error = null,
  autoFocus = false,
  autoComplete = '',
  required = false,
  disabled = false,
  className = '',
  style,
  maxLength,
  ...props
}) {
  return (
    <div className={`field ${className}`} style={style}>
      {label && (
        <label className="field__label">
          {label}
          {required && <span style={{ color: 'var(--color-destructive)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`field__input${error ? ' field__input--error' : ''}`}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        disabled={disabled}
        maxLength={maxLength}
        {...props}
      />
      {error && (
        <span className="field__error" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>!</span> {error}
        </span>
      )}
    </div>
  );
}