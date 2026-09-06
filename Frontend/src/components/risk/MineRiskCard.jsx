import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../common/Card.jsx';
import RiskBadge from '../common/RiskBadge.jsx';

export default function MineRiskCard({ risk }) {
  const TrendIcon = risk.trend === 'up' ? TrendingUp : TrendingDown;
  const trendColor = risk.trend === 'up' ? 'text-status-danger' : 'text-status-success';

  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <Link to={`/mines/${risk.mineId}`} className="text-sm font-semibold text-ink-900 hover:underline">
            {risk.mineName}
          </Link>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-500">
            Previous score: {risk.previousScore}
            <TrendIcon size={12} className={trendColor} />
          </p>
        </div>
        <RiskBadge level={risk.level} score={risk.score} />
      </div>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Risk Contributors</p>
      <ul className="space-y-1.5">
        {risk.contributors.map((c) => (
          <li key={c.label}>
            <div className="mb-0.5 flex items-center justify-between text-xs text-ink-700">
              <span>{c.label}</span>
              <span className="font-mono text-ink-500">{c.weight}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-brand-700" style={{ width: `${c.weight}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
