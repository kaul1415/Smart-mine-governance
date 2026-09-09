// Shared, small formatting helpers so date/time formatting stays
// consistent across flags, responses, corrective actions, and the
// audit trail instead of every page rolling its own.

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTimeOnly(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export function isOverdue(dueDateIso, status) {
  if (['Closed', 'Verified', 'Resolved', 'Dismissed'].includes(status)) return false;
  return new Date(dueDateIso).getTime() < Date.now();
}
