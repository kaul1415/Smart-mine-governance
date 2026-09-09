import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, RefreshCw, Link as LinkIcon, Database } from 'lucide-react';
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
  const [state, setState] = useState({ status: 'loading', logs: [], error: null });
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  async function load() {
    setState({ status: 'loading', logs: [], error: null });
    try {
      const logs = await auditService.getAuditLogs();
      setState({ status: 'success', logs: Array.isArray(logs) ? logs : (logs?.data || []), error: null });
    } catch (err) {
      setState({ status: 'error', logs: [], error: err.message || 'Unable to load the audit trail.' });
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await auditService.verifyBlockchain();
      setVerificationResult(res?.integrity || res);
    } catch (err) {
      setVerificationResult({
        isValid: false,
        message: err.message || 'Verification service unreachable.',
      });
    } finally {
      setVerifying(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const logsList = Array.isArray(state.logs) ? state.logs : [];
  const filtered = logsList.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (log.actor || '').toLowerCase().includes(q) ||
      (log.entity || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.hash || '').toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <PageHeader
          title="Blockchain Audit Trail"
          description="Immutable, cryptographically chained SHA-256 ledger recording all governance activities."
        />
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <RefreshCw size={14} className="animate-spin mr-1.5" />
                Verifying Chain…
              </>
            ) : (
              <>
                <ShieldCheck size={14} className="mr-1.5 text-emerald-600" />
                Verify Ledger Integrity
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Blockchain Verification & Status Banner */}
      {verificationResult && (
        <div
          className={`mb-4 p-3.5 rounded-lg border text-sm flex items-start gap-3 transition-all ${
            verificationResult.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {verificationResult.isValid ? (
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="font-medium">
              {verificationResult.isValid
                ? 'Cryptographic Ledger Integrity Verified — 100% Tamper Proof'
                : 'Ledger Tamper Detected!'}
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              {verificationResult.message ||
                `All ${verificationResult.totalBlocks || logsList.length} blocks verified against sequential SHA-256 hash pointers.`}
            </p>
            {verificationResult.tamperedBlock && (
              <div className="mt-2 text-xs font-mono bg-white/70 p-2 rounded border border-rose-200">
                Block #{verificationResult.tamperedBlock.blockIndex}: {verificationResult.tamperedBlock.reason}
              </div>
            )}
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="text-xs opacity-60 hover:opacity-100 font-semibold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ledger Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-brand-50 text-brand-600">
            <Database size={18} />
          </div>
          <div>
            <div className="text-xs text-ink-500 font-medium">Total Ledger Blocks</div>
            <div className="text-lg font-bold text-ink-900">{logsList.length}</div>
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-50 text-emerald-600">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-xs text-ink-500 font-medium">Chaining Algorithm</div>
            <div className="text-sm font-semibold text-ink-800">SHA-256 Hash Chained</div>
          </div>
        </div>
        <div className="bg-surface rounded-lg border border-border p-3 flex items-center gap-3">
          <div className="p-2 rounded bg-indigo-50 text-indigo-600">
            <LinkIcon size={18} />
          </div>
          <div>
            <div className="text-xs text-ink-500 font-medium">Storage Engine</div>
            <div className="text-sm font-semibold text-ink-800">PostgreSQL (coalgov_db)</div>
          </div>
        </div>
      </div>

      <div className="mb-4 max-w-sm">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by block hash, action, entity, user…"
        />
      </div>

      <Card>
        {state.status === 'loading' && <LoadingState label="Loading blockchain audit trail…" />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'success' && filtered.length === 0 && (
          <EmptyState title="No activity found" description="Try a different search term or register an action." />
        )}
        {state.status === 'success' && filtered.length > 0 && (
          <Timeline
            items={filtered.map((log, index) => ({
              id: log.id || `log-${index}`,
              timestamp: log.timestamp,
              actor: log.actor || (log.user ? log.user.name : 'System'),
              actorType: log.actorType || (log.userId ? 'user' : 'system'),
              action: (log.action || '').toLowerCase().replace(/_/g, ' '),
              entity: log.entity,
              hash: log.hash,
              blockIndex: log.blockIndex || (index + 1),
              previousHash: log.previousHash,
            }))}
          />
        )}
      </Card>
    </>
  );
}
