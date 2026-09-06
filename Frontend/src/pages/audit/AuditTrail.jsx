import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import { auditService } from '../../services/auditService.js';

export default function AuditTrail() {
  const [state, setState] = useState({ status: 'loading', logs: [], error: null });
  const [search, setSearch] = useState('');

  async function load() {
    setState({ status: 'loading', logs: [], error: null });
    try {
      const logs = await auditService.getAuditLogs();
      setState({ status: 'success', logs, error: null });
    } catch (err) {
      setState({ status: 'error', logs: [], error: err.message || 'Unable to load the audit trail.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return log.actor.toLowerCase().includes(q) || log.entity.toLowerCase().includes(q) || log.action.toLowerCase().includes(q);
  });

  return (
    <>
      <PageHeader title="Audit Trail" description="A read-only, system-recorded history of governance activity." />
      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by user, action, or entity ID…" />
      </div>
      <Card>
        {state.status === 'loading' && <LoadingState label="Loading audit trail…" />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'success' && filtered.length === 0 && (
          <EmptyState title="No activity found" description="Try a different search term." />
        )}
        {state.status === 'success' && filtered.length > 0 && (
          <Timeline
            items={filtered.map((log) => ({
              id: log.id,
              timestamp: log.timestamp,
              actor: log.actor,
              actorType: log.actorType,
              action: log.action.toLowerCase(),
              entity: log.entity,
            }))}
          />
        )}
      </Card>
    </>
  );
}
