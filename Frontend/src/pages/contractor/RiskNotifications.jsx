import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDateTime } from '../../utils/format.js';

export default function RiskNotifications() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', items: [], error: null });

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', items: [], error: null });
    try {
      const items = await contractorService.getRiskNotifications(contractorId);
      setState({ status: 'success', items, error: null });
    } catch (err) {
      setState({ status: 'error', items: [], error: err.message || 'Unable to load risk notifications.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  return (
    <>
      <PageHeader title="Risk Notifications" description="Why your organization's risk score changed, explained." />

      {state.status === 'loading' && <LoadingState label="Loading risk notifications…" />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
      {state.status === 'success' && state.items.length === 0 && (
        <Card>
          <EmptyState title="No risk notifications yet" />
        </Card>
      )}
      {state.status === 'success' && state.items.length > 0 && (
        <div className="space-y-3">
          {state.items.map((n) => {
            const up = n.delta > 0;
            const Icon = up ? TrendingUp : TrendingDown;
            return (
              <Card key={n.id}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 rounded-full p-1.5 ${up ? 'bg-status-dangerBg text-status-danger' : 'bg-status-successBg text-status-success'}`}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-sm font-semibold ${up ? 'text-status-danger' : 'text-status-success'}`}>
                        {up ? '+' : ''}
                        {n.delta} risk points
                      </span>
                      <span className="text-xs text-ink-500">{formatDateTime(n.date)}</span>
                    </div>
                    <p className="text-sm text-ink-700">{n.message}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
