import { useEffect, useState } from 'react';
import { HardHat } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_TONE = { Valid: 'bg-status-successBg text-status-success', 'Expiring Soon': 'bg-status-warningBg text-status-warning', Expired: 'bg-status-dangerBg text-status-danger' };

export default function SafetyRequirements() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', items: [], error: null });

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', items: [], error: null });
    try {
      const items = await contractorService.getSafetyRequirements(contractorId);
      setState({ status: 'success', items, error: null });
    } catch (err) {
      setState({ status: 'error', items: [], error: err.message || 'Unable to load safety requirements.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  return (
    <>
      <PageHeader title="Safety Requirements" description="Certification and training status for your workforce." />

      {state.status === 'loading' && <LoadingState label="Loading safety requirements…" />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
      {state.status === 'success' && state.items.length === 0 && (
        <Card>
          <EmptyState title="No safety requirements tracked yet" />
        </Card>
      )}
      {state.status === 'success' && state.items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {state.items.map((item) => (
            <Card key={item.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
                  <HardHat size={14} className="text-brand-700" />
                  {item.requirement}
                </p>
                <span className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-medium ${STATUS_TONE[item.status]}`}>{item.status}</span>
              </div>
              <p className="text-xs text-ink-500">
                {item.status === 'Expired' ? 'Expired on' : 'Valid until'} {formatDate(item.expiryDate)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
