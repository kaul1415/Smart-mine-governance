import { Link } from 'react-router-dom';
import { Map as MapIcon, ArrowRight } from 'lucide-react';
import Card from '../common/Card.jsx';
import RiskBadge from '../common/RiskBadge.jsx';

export default function RiskMapPreviewCard({ mines }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-ink-900">Risk Map</h3>
        <Link to="/risk/map" className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline">
          Open full map <ArrowRight size={12} />
        </Link>
      </div>
      <div className="px-5 py-4">
        <div className="mb-4 flex h-28 items-center justify-center rounded border border-dashed border-border-strong bg-surface-sunken text-ink-500">
          <div className="flex flex-col items-center gap-1 text-xs">
            <MapIcon size={20} />
            <span>GIS risk map — Phase 4</span>
          </div>
        </div>
        <ul className="space-y-2">
          {mines.map((mine) => (
            <li key={mine.id} className="flex items-center justify-between text-sm">
              <span className="truncate text-ink-700">{mine.name}</span>
              <RiskBadge level={mine.riskLevel} />
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
