export default function Card({ children, className = '', padded = true, as: Component = 'div', ...rest }) {
  return (
    <Component
      className={`bg-surface-card border border-border rounded-md shadow-card ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
