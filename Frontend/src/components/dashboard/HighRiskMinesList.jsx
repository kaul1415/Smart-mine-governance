import { Link } from 'react-router-dom';
import Card from '../common/Card.jsx';
import RiskBadge from '../common/RiskBadge.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { MapPin } from 'lucide-react';

export default function HighRiskMinesList({ mines }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">High Risk Mines</h3>
        <Link to="/mines" className="text-xs font-medium text-brand-700 hover:underline">
          View all mines
        </Link>
      </div>
      {mines.length === 0 ? (
        <EmptyState title="No high-risk mines" description="All mines are currently within acceptable risk levels." />
      ) : (
        <ul className="divide-y divide-border">
          {mines.map((mine) => (
            <li key={mine.id}>
              <Link to={`/mines/${mine.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-surface-sunken">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-900">{mine.name}</p>
                  <p className="flex items-center gap-1 truncate text-xs text-ink-500">
                    <MapPin size={12} /> {mine.location}
                  </p>
                </div>
                <RiskBadge level={mine.riskLevel} score={mine.riskScore} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
