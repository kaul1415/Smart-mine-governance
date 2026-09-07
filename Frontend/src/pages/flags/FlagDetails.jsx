import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, Gauge } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import ReporterIdentity from '../../components/flags/ReporterIdentity.jsx';
import ResponseCard from '../../components/responses/ResponseCard.jsx';
import SubmitResponseForm from '../../components/responses/SubmitResponseForm.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { canSubmitResponse } from '../../utils/roles.js';
import { flagService } from '../../services/flagService.js';
import { responseService } from '../../services/responseService.js';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { riskService } from '../../services/riskService.js';
import { auditService } from '../../services/auditService.js';
import { formatDateTime } from '../../utils/format.js';

export default function FlagDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const flag = await flagService.getFlagById(id);
      if (!flag) {
        setState({ status: 'success', data: { flag: null }, error: null });
        return;
      }
      const [responses, actions, risk, audit] = await Promise.all([
        responseService.getResponsesForFlag(id),
        correctiveActionService.getCorrectiveActionsForFlag(id),
        riskService.getRiskForMine(flag.mineId),
        auditService.getAuditLogsForEntity(id),
      ]);
      setState({ status: 'success', data: { flag, responses, actions, risk, audit }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load this flag.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmitResponse(payload) {
    await responseService.submitResponse({ ...payload, flagId: id });
    await load();
  }

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Flags', path: '/flags' }, { label: id }]} />
        <LoadingState label="Loading flag…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Flags', path: '/flags' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { flag, responses, actions, risk, audit } = state.data;

  if (!flag) {
    return (
      <>
        <PageHeader title="Flag not found" breadcrumbs={[{ label: 'Flags', path: '/flags' }]} />
        <Card>
          <EmptyState title="This ticket doesn't exist" description={`No flag found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={flag.id}
        description={`${flag.category} · ${flag.mineName}`}
        breadcrumbs={[{ label: 'Flags', path: '/flags' }, { label: flag.id }]}
        actions={<StatusBadge status={flag.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Report Details</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Location</dt>
                <dd className="text-sm text-ink-900">{flag.location}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Severity</dt>
                <dd className="text-sm text-ink-900">{flag.severity}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Assigned Authority</dt>
                <dd className="text-sm text-ink-900">{flag.assignedAuthority}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Created</dt>
                <dd className="text-sm text-ink-900">{formatDateTime(flag.createdAt)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Description</dt>
                <dd className="text-sm text-ink-900">{flag.description}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Reporter</dt>
                <dd>
                  <ReporterIdentity flag={flag} />
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Evidence</dt>
                <dd className="flex items-center gap-1.5 text-sm text-ink-900">
                  {flag.evidenceCount ? (
                    <>
                      <Paperclip size={14} className="text-ink-500" /> {flag.evidenceCount} file(s) attached
                    </>
                  ) : (
                    <span className="text-ink-500">No evidence attached</span>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Official Responses</h3>
            {responses.length === 0 ? (
              <EmptyState title="No official response yet" description="Once an authority responds, it will appear here." />
            ) : (
              <div className="space-y-2.5">
                {responses.map((r) => (
                  <ResponseCard key={r.id} response={r} />
                ))}
              </div>
            )}
            {canSubmitResponse(user) && (
              <div className="mt-3">
                <SubmitResponseForm authorName={user.name} onSubmit={handleSubmitResponse} />
              </div>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Corrective Actions</h3>
            {actions.length === 0 ? (
              <EmptyState title="No corrective action raised" description="Corrective actions linked to this flag will appear here." />
            ) : (
              <ul className="divide-y divide-border">
                {actions.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => navigate(`/corrective-actions/${a.id}`)}
                      className="flex w-full items-center justify-between gap-3 py-2.5 text-left hover:bg-surface-sunken"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-ink-900">
                          <span className="font-mono text-xs text-ink-500">{a.id}</span>
                          <span className="truncate">{a.issue}</span>
                        </p>
                        <p className="truncate text-xs text-ink-500">Assigned to {a.assignedTo}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <Gauge size={15} /> Risk Impact
            </h3>
            {risk ? (
              <div className="space-y-2">
                <RiskBadge level={risk.level} score={risk.score} />
                <p className="text-xs text-ink-500">
                  {flag.mineName} risk score, computed by the risk engine — this ticket is one contributing factor.
                </p>
              </div>
            ) : (
              <p className="text-sm text-ink-500">No risk score available for this mine yet.</p>
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Timeline & Audit History</h3>
            {audit.length === 0 ? (
              <EmptyState title="No activity recorded" />
            ) : (
              <Timeline
                items={audit.map((a) => ({
                  id: a.id,
                  timestamp: a.timestamp,
                  actor: a.actor,
                  actorType: a.actorType,
                  action: a.action.toLowerCase(),
                  entity: a.entity !== flag.id ? a.entity : undefined,
                }))}
              />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
