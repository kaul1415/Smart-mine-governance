import { Link } from 'react-router-dom';
import { Repeat } from 'lucide-react';
import Card from '../common/Card.jsx';
import RiskBadge from '../common/RiskBadge.jsx';

export default function RecurringIssueCard({ issue }) {
  return (
    <Card>
      <div className="mb-2 flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Repeat size={14} className="text-brand-700" />
          {issue.issueType}
        </p>
        <RiskBadge level={issue.riskLevel} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <div>
          <dt className="text-xs text-ink-500">Occurrences</dt>
          <dd className="font-medium text-ink-900">{issue.occurrencesTotal}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Last 3 months</dt>
          <dd className="font-medium text-ink-900">{issue.occurrencesLast3Months}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Mine</dt>
          <dd className="text-ink-900">
            <Link to={`/mines/${issue.mineId}`} className="hover:underline">
              {issue.mineName}
            </Link>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Contractor Involved</dt>
          <dd className="text-ink-900">{issue.contractorInvolved}</dd>
        </div>
      </dl>
      <p className="mt-2.5 border-t border-border pt-2.5 text-xs text-ink-500">
        <span className="font-medium text-ink-700">Recommendation: </span>
        {issue.recommendation}
      </p>
    </Card>
  );
}
