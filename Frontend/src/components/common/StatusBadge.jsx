// Generic status → tone mapping shared by flags, responses and
// corrective actions. A status not listed here falls back to
// "neutral" rather than throwing, since new statuses will keep
// appearing as later phases add modules.
const STATUS_TONE = {
  New: 'info',
  'Under Review': 'warning',
  Assigned: 'info',
  Investigation: 'warning',
  'Action Required': 'danger',
  'Action Taken': 'info',
  Resolved: 'success',
  Dismissed: 'neutral',
  Closed: 'neutral',
  Open: 'info',
  'In Progress': 'warning',
  'Submitted for Verification': 'info',
  Verified: 'success',
  Rejected: 'danger',
};

const TONE_CLASSES = {
  info: 'bg-status-infoBg text-status-info',
  warning: 'bg-status-warningBg text-status-warning',
  danger: 'bg-status-dangerBg text-status-danger',
  success: 'bg-status-successBg text-status-success',
  neutral: 'bg-status-neutralBg text-status-neutral',
};

export default function StatusBadge({ status, tone }) {
  const resolvedTone = tone || STATUS_TONE[status] || 'neutral';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[resolvedTone]}`}
    >
      {status}
    </span>
  );
}
