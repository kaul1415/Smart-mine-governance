const TONE_BAR = {
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  danger: 'bg-status-danger',
  brand: 'bg-brand-700',
};

function toneForValue(value) {
  if (value >= 80) return 'success';
  if (value >= 60) return 'warning';
  return 'danger';
}

export default function ProgressBar({ label, value, tone }) {
  const resolvedTone = tone || toneForValue(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink-700">{label}</span>
        <span className="font-mono font-medium text-ink-900">{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div className={`h-full rounded-full ${TONE_BAR[resolvedTone]}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
