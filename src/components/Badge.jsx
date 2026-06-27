/**
 * Badge — PEEKAY status indicator
 * Variants: default | warning | info | success | danger | primary
 * Shows status labels, priority, categories, etc.
 */
export default function Badge({
  variant = 'default',
  children,
  className = '',
  size = 'md',
}) {
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';
  


  
  return (
    <span className={`badge badge-${variant} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}