/**
 * Badge — PEEKAY component
 * Variants: default | warning | info | success | danger | primary
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}