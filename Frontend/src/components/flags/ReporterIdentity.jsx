import { EyeOff, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { canSeeReporterIdentity } from '../../utils/roles.js';

// IMPORTANT: this is a UI-only convenience. The backend decides what
// identity data is actually sent to this client — hiding it here is
// not a substitute for the backend never sending it to unauthorized
// roles in the first place.
export default function ReporterIdentity({ flag }) {
  const { user } = useAuth();
  const canReveal = flag.isConfidential ? canSeeReporterIdentity(user?.role) : true;

  if (!canReveal) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-ink-500">
        <EyeOff size={14} />
        Anonymous / Confidential
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ink-900">
      <User size={14} className="text-ink-500" />
      {flag.reporterName}
      {flag.isConfidential && <span className="text-xs text-ink-500">(visible to your role only)</span>}
    </span>
  );
}
