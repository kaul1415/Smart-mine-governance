import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { complianceService } from '../../services/complianceService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_TONE = { Compliant: 'success', 'Due Soon': 'warning', Overdue: 'danger', 'Non-Compliant': 'danger' };

export default function ComplianceDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', item: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', item: null, error: null });
    try {
      const item = await complianceService.getComplianceRequirementById(id);
      setState({ status: 'success', item, error: null });
    } catch (err) {
      setState({ status: 'error', item: null, error: err.message || 'Unable to load this requirement.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: id }]} />
        <LoadingState label="Loading requirement…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { item } = state;

  if (!item) {
    return (
      <>
        <PageHeader title="Requirement not found" breadcrumbs={[{ label: 'Compliance', path: '/compliance' }]} />
        <Card>
          <EmptyState title="This requirement doesn't exist" description={`No compliance requirement found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={item.requirement}
        description={item.mineName}
        breadcrumbs={[{ label: 'Compliance', path: '/compliance' }, { label: item.id }]}
        actions={<StatusBadge status={item.status} tone={STATUS_TONE[item.status]} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Regulation / Reference</dt>
                <dd className="text-sm text-ink-900">{item.regulationRef}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Frequency</dt>
                <dd className="text-sm text-ink-900">{item.frequency}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Responsible Person</dt>
                <dd className="text-sm text-ink-900">{item.responsiblePerson}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Due Date</dt>
                <dd className="text-sm text-ink-900">{formatDate(item.dueDate)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Description</dt>
                <dd className="text-sm text-ink-900">{item.description}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Evidence</h3>
            {item.evidence?.length > 0 ? (
              <ul className="space-y-1.5">
                {item.evidence.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-ink-700">
                    <FileText size={14} className="text-ink-500" /> {doc}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No evidence uploaded yet" />
            )}
          </Card>
        </div>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">History</h3>
          {item.history?.length > 0 ? (
            <Timeline
              items={item.history.map((h, i) => ({ id: `${item.id}-h${i}`, timestamp: h.date, actor: h.by, actorType: h.by === 'System' ? 'system' : 'user', action: h.action.toLowerCase() }))}
            />
          ) : (
            <EmptyState title="No history recorded" />
          )}
        </Card>
      </div>

      <p className="mt-4 text-xs text-ink-500">
        Related mine: <Link to={`/mines/${item.mineId}`} className="text-brand-700 hover:underline">{item.mineName}</Link>
      </p>
    </>
  );
}
