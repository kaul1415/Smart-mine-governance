import { Bot } from 'lucide-react';
import RiskBadge from '../common/RiskBadge.jsx';

// Purely a display component — the analysis it renders always comes
// from a backend/AI service response (or a mock standing in for
// one). No scoring or classification logic lives here.
export default function AIAnalysisPanel({ analysis }) {
  if (!analysis) return null;
  return (
    <div className="rounded border border-brand-100 bg-brand-100/40 p-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-800">
        <Bot size={13} /> AI Analysis
      </p>
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-ink-500">Category</dt>
          <dd className="font-medium text-ink-900">{analysis.category}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Severity</dt>
          <dd>
            <RiskBadge level={analysis.severity} />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Risk</dt>
          <dd className="font-mono font-medium text-ink-900">{analysis.riskScore}/100</dd>
        </div>
      </dl>
      <div className="mt-2.5">
        <dt className="text-xs text-ink-500">Recommendation</dt>
        <dd className="text-sm text-ink-900">{analysis.recommendation}</dd>
      </div>
    </div>
  );
}
