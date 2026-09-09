import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';

const METRIC_LABELS = {
  safetyCompliance: 'Safety Compliance',
  taskCompletion: 'Task Completion',
  inspectionScore: 'Inspection Score',
  documentation: 'Documentation',
};

export default function Performance() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', performance: null, error: null });

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', performance: null, error: null });
    try {
      const performance = await contractorService.getPerformance(contractorId);
      setState({ status: 'success', performance, error: null });
    } catch (err) {
      setState({ status: 'error', performance: null, error: err.message || 'Unable to load performance data.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Performance" />
        <LoadingState label="Loading performance…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="Performance" />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  if (!state.performance) {
    return (
      <>
        <PageHeader title="Performance" />
        <Card>
          <EmptyState title="No performance data available yet" />
        </Card>
      </>
    );
  }

  const { overall, ...metrics } = state.performance;

  return (
    <>
      <PageHeader title="Performance" description="How your organization is scoring across governance categories." />

      <Card className="mb-4 max-w-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Overall Performance</p>
        <p className="mt-1 text-3xl font-semibold text-ink-900">{overall}%</p>
      </Card>

      <Card className="max-w-xl space-y-4">
        {Object.entries(metrics).map(([key, value]) => (
          <ProgressBar key={key} label={METRIC_LABELS[key] || key} value={value} />
        ))}
      </Card>
    </>
  );
}
