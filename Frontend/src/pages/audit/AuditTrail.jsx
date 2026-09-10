import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Link as LinkIcon, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Timeline from '../../components/common/Timeline.jsx';
import Button from '../../components/common/Button.jsx';
import { auditService } from '../../services/auditService.js';

export default function AuditTrail() {
  const [state, setState] = useState({ status: 'loading', logs: [], verification: null, error: null });
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function load() {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const [logs, verification] = await Promise.all([
        auditService.getAuditLogs(),
        auditService.verifyAuditChain().catch(() => null),
      ]);
      setState({ status: 'success', logs, verification, error: null });
    } catch (err) {
      setState({ status: 'error', logs: [], verification: null, error: err.message || 'Unable to load the audit trail.' });
    }
  }

  async function recheckChain() {
    setVerifying(true);
    try {
      const verification = await auditService.verifyAuditChain();
      setState((s) => ({ ...s, verification }));
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.actor?.toLowerCase().includes(q) ||
      log.entity?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.hash?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <PageHeader
        title="Cryptographic Audit Trail"
        description="A tamper-evident, SHA-256 hash-chained history of statutory governance activity stored in PostgreSQL."
      />

      {state.verification && (
        <div
          className={`mb-5 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
            state.verification.verified
              ? 'border-status-success/30 bg-status-success/5 text-ink-900'
              : 'border-status-danger/30 bg-status-danger/5 text-status-danger'
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                state.verification.verified
                  ? 'bg-status-success/20 text-status-success'
                  : 'bg-status-danger/20 text-status-danger'
              }`}
            >
              {state.verification.verified ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {state.verification.verified
                  ? 'Cryptographic Chain Verified — 100% Tamper-Evident'
                  : 'Cryptographic Hash Chain Integrity Warning'}
              </p>
              <p className="text-xs text-ink-600">
                {state.verification.verified ? (
                  <>
                    All <span className="font-semibold">{state.verification.totalRecords} records</span> verified via{' '}
                    <span className="font-mono text-ink-800">SHA-256</span> cryptographic hash chaining in database.
                    Latest hash: <span className="font-mono text-[11px] text-ink-700">{state.verification.latestHash?.substring(0, 18)}…</span>
                  </>
                ) : (
                  `Integrity anomaly detected on ${state.verification.tamperedCount} record(s).`
                )}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={recheckChain}
            disabled={verifying}
            icon={RefreshCw}
            className={verifying ? 'animate-spin' : ''}
          >
            {verifying ? 'Verifying…' : 'Verify Integrity'}
          </Button>
        </div>
      )}

      <div className="mb-4 max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by user, action, entity, or hash…" />
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
              hash: log.hash,
              previousHash: log.previousHash,
            }))}
          />
        )}
      </Card>
    </>
  );
}
