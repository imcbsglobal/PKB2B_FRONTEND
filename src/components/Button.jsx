/**
 * Button — PEEKAY component
 * Uses CSS classes from components.css (btn, btn-{variant}, btn-{size}, btn-full)
 */
export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
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
    <button type={type} disabled={disabled || loading} className={cls} {...props}>
      {loading ? 'Loading…' : children}
    </button>
  );
}