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
import { responseService } from '../../services/responseService.js';
import { auditService } from '../../services/auditService.js';
import { formatDateTime } from '../../utils/format.js';

export default function ResponseDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const response = await responseService.getResponseById(id);
      if (!response) {
        setState({ status: 'success', data: { response: null }, error: null });
        return;
      }
      const audit = await auditService.getAuditLogsForEntity(id);
      setState({ status: 'success', data: { response, audit }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load this response.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Responses', path: '/responses' }, { label: id }]} />
        <LoadingState label="Loading response…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Responses', path: '/responses' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { response, audit } = state.data;

  if (!response) {
    return (
      <>
        <PageHeader title="Response not found" breadcrumbs={[{ label: 'Responses', path: '/responses' }]} />
        <Card>
          <EmptyState title="This response doesn't exist" description={`No response found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={response.id}
        description={`Response to ${response.flagId}`}
        breadcrumbs={[{ label: 'Responses', path: '/responses' }, { label: response.id }]}
        actions={<StatusBadge status={response.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Ticket ID</dt>
                <dd>
                  <Link to={`/flags/${response.flagId}`} className="font-mono text-sm text-brand-700 hover:underline">
                    {response.flagId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Authority</dt>
                <dd className="text-sm text-ink-900">{response.authority}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Response Type</dt>
                <dd className="text-sm text-ink-900">{response.responseType}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Date</dt>
                <dd className="text-sm text-ink-900">{formatDateTime(response.date)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Official Response</dt>
                <dd className="text-sm text-ink-900">{response.officialResponse}</dd>
              </div>
              {response.actionTaken && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Action Taken</dt>
                  <dd className="text-sm text-ink-900">{response.actionTaken}</dd>
                </div>
              )}
              {response.reason && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Reason</dt>
                  <dd className="text-sm text-ink-900">{response.reason}</dd>
                </div>
              )}
            </dl>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Supporting Documents</h3>
            {response.supportingDocuments?.length > 0 ? (
              <ul className="space-y-1.5">
                {response.supportingDocuments.map((doc) => (
                  <li key={doc} className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm text-ink-700">
                    <FileText size={14} className="text-ink-500" /> {doc}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No documents attached" />
            )}
          </Card>
        </div>

        <Card>
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Timeline</h3>
          {audit.length === 0 ? (
            <EmptyState title="No activity recorded" />
          ) : (
            <Timeline
              items={audit.map((a) => ({ id: a.id, timestamp: a.timestamp, actor: a.actor, actorType: a.actorType, action: a.action.toLowerCase(), hash: a.hash }))}
            />
          )}
        </Card>
      </div>
    </>
  );
}
