import { Link } from 'react-router-dom';
import Card from './Card.jsx';

const TONE_STYLES = {
  neutral: 'text-ink-900',
  danger: 'text-status-danger',
  warning: 'text-status-warning',
  success: 'text-status-success',
};

export default function StatCard({ label, value, tone = 'neutral', hint, icon: Icon, to }) {
  const content = (
    <Card className="h-full transition-shadow hover:shadow-popover" padded>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
          <p className={`mt-2 text-2xl font-semibold ${TONE_STYLES[tone]}`}>{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
        </div>
        {Icon && (
          <span className="rounded-md bg-surface-sunken p-2 text-brand-700">
            <Icon size={18} />
          </span>
        )}
      </div>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}
