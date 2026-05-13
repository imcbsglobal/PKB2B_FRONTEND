/**
 * Button — PEEKAY component
 * Professional button with variants: primary, outline, ghost, destructive
 * Sizes: sm | md | lg
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  title = '',
  ...props
}) {
  const sizeMap = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  const cls = [
    'btn',
    `btn-${variant}`,
    sizeMap[size] ?? '',
    fullWidth ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cls}
      onClick={onClick}
      title={title}
      {...props}
    >
      {loading ? (
        <>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            border: '2px solid currentColor',
            borderRadius: '50%',
            borderTopColor: 'transparent',
            animation: 'spin 0.6s linear infinite',
          }} />
          Loading…
        </>
      ) : (
        children
      )}
    </button>
  );
}