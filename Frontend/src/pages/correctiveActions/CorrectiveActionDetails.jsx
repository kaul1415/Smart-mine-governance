import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { auditService } from '../../services/auditService.js';
import { actionsForCorrectiveAction } from '../../utils/correctiveActionWorkflow.js';
import { formatDate, formatDateTime, isOverdue } from '../../utils/format.js';

export default function CorrectiveActionDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [comment, setComment] = useState('');
  const [pendingTransition, setPendingTransition] = useState(null);

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const action = await correctiveActionService.getCorrectiveActionById(id);
      if (!action) {
        setState({ status: 'success', data: { action: null }, error: null });
        return;
      }
      const audit = await auditService.getAuditLogsForEntity(id);
      setState({ status: 'success', data: { action, audit }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load this corrective action.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function applyTransition(nextStatus) {
    await correctiveActionService.updateCorrectiveAction(id, { status: nextStatus, isOverdue: false });
    setPendingTransition(null);
    await load();
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    await correctiveActionService.addComment(id, { author: user?.name || 'You', text: comment });
    setComment('');
    await load();
  }

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Corrective Actions', path: '/corrective-actions' }, { label: id }]} />
        <LoadingState label="Loading corrective action…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Corrective Actions', path: '/corrective-actions' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { action, audit } = state.data;

  if (!action) {
    return (
      <>
        <PageHeader title="Corrective action not found" breadcrumbs={[{ label: 'Corrective Actions', path: '/corrective-actions' }]} />
        <Card>
          <EmptyState title="This action doesn't exist" description={`No corrective action found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  const availableTransitions = actionsForCorrectiveAction(action.status, user);
  const overdue = isOverdue(action.dueDate, action.status);

  return (
    <>
      <PageHeader
        title={action.id}
        description={action.issue}
        breadcrumbs={[{ label: 'Corrective Actions', path: '/corrective-actions' }, { label: action.id }]}
        actions={<StatusBadge status={action.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Original Issue</dt>
                <dd className="text-sm text-ink-900">{action.issue}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Recommendation</dt>
                <dd className="text-sm text-ink-900">{action.recommendation}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Assigned To</dt>
                <dd className="text-sm text-ink-900">{action.assignedTo}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Priority</dt>
                <dd>
                  <RiskBadge level={action.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Deadline</dt>
                <dd className={`text-sm ${overdue ? 'font-medium text-status-danger' : 'text-ink-900'}`}>
                  {formatDate(action.dueDate)} {overdue && '(overdue)'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Linked Flag</dt>
                <dd className="text-sm">
                  <Link to={`/flags/${action.flagId}`} className="font-mono text-brand-700 hover:underline">
                    {action.flagId}
                  </Link>
                </dd>
              </div>
            </dl>

            {availableTransitions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                {availableTransitions.map((t) => (
                  <Button
                    key={t.label}
                    size="sm"
                    variant={t.label === 'Reject' ? 'danger' : 'primary'}
                    onClick={() => setPendingTransition(t)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Evidence</h3>
            {action.evidence?.length > 0 ? (
              <ul className="space-y-1.5">
                {action.evidence.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-ink-700">
                    <FileText size={14} className="text-ink-500" /> {doc}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No evidence uploaded yet" />
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Comments</h3>
            {action.comments?.length > 0 ? (
              <ul className="mb-3 space-y-2.5">
                {action.comments.map((c) => (
                  <li key={c.id} className="rounded border border-border p-2.5">
                    <p className="text-sm text-ink-900">{c.text}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {c.author} · {formatDateTime(c.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No comments yet" />
            )}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600"
              />
              <Button type="submit" size="sm" icon={Send}>
                Post
              </Button>
            </form>
          </Card>
        </div>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Timeline</h3>
          {audit.length === 0 ? (
            <EmptyState title="No activity recorded" />
          ) : (
            <Timeline
              items={audit.map((a) => ({ id: a.id, timestamp: a.timestamp, actor: a.actor, actorType: a.actorType, action: a.action.toLowerCase() }))}
            />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={!!pendingTransition}
        title={`${pendingTransition?.label} this action?`}
        description={`This will move ${action.id} to "${pendingTransition?.nextStatus}".`}
        confirmLabel={pendingTransition?.label}
        variant={pendingTransition?.label === 'Reject' ? 'danger' : 'primary'}
        onConfirm={() => applyTransition(pendingTransition.nextStatus)}
        onCancel={() => setPendingTransition(null)}
      />
    </>
  );
}
