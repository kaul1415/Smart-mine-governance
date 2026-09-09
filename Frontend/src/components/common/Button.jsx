const VARIANTS = {
  primary: 'bg-brand-800 text-white hover:bg-brand-700 disabled:bg-brand-800/50',
  secondary: 'bg-surface-card text-ink-700 border border-border-strong hover:bg-surface-sunken',
  ghost: 'text-ink-700 hover:bg-surface-sunken',
  danger: 'bg-status-danger text-white hover:opacity-90',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}
      {children}
    </button>
  );
}
