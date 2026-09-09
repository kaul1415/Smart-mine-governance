import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Map as MapIcon } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import Button from '../../components/common/Button.jsx';
import MineRiskCard from '../../components/risk/MineRiskCard.jsx';
import RecurringIssueCard from '../../components/risk/RecurringIssueCard.jsx';
import RiskTrendChart from '../../components/risk/RiskTrendChart.jsx';
import { riskService } from '../../services/riskService.js';

export default function RiskIntelligence() {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  async function load() {
    setState({ status: 'loading', data: null, error: null });
    try {
      const [riskScores, recurringIssues] = await Promise.all([
        riskService.getRiskScores(),
        riskService.getRecurringIssues(),
      ]);
      setState({ status: 'success', data: { riskScores, recurringIssues }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load risk intelligence.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="Risk Intelligence" description="Mine-level risk scores computed by the backend risk engine." />
        <LoadingState label="Loading risk intelligence…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="Risk Intelligence" description="Mine-level risk scores computed by the backend risk engine." />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { riskScores, recurringIssues } = state.data;
  const sorted = [...riskScores].sort((a, b) => b.score - a.score);

  return (
    <>
      <PageHeader
        title="Risk Intelligence"
        description="Mine-level risk scores, contributors, and recurring patterns — all computed by the backend risk engine and displayed here as-is."
        actions={
          <Link to="/risk/map">
            <Button variant="secondary" icon={MapIcon}>
              Open Risk Map
            </Button>
          </Link>
        }
      />

      <div className="mb-6">
        <RiskTrendChart riskScores={sorted} />
      </div>

      <h3 className="mb-3 text-sm font-semibold text-ink-900">Mine Risk Breakdown</h3>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((r) => (
          <MineRiskCard key={r.mineId} risk={r} />
        ))}
      </div>

      <h3 className="mb-3 text-sm font-semibold text-ink-900">Recurring Issues Detected</h3>
      {recurringIssues.length === 0 ? (
        <EmptyState title="No recurring patterns detected" description="AI-detected recurring issues will appear here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recurringIssues.map((issue) => (
            <RecurringIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </>
  );
}
