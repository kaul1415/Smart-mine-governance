import { useEffect, useState } from 'react';
import { FolderKanban, Users, ShieldCheck, Wrench, Gauge, TrendingUp } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', data: null, error: null });
    try {
      const [contractor, projects, riskNotifications, performance] = await Promise.all([
        contractorService.getContractorById(contractorId),
        contractorService.getProjects(contractorId),
        contractorService.getRiskNotifications(contractorId),
        contractorService.getPerformance(contractorId),
      ]);
      setState({ status: 'success', data: { contractor, projects, riskNotifications, performance }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load your dashboard.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  if (!contractorId) {
    return (
      <>
        <PageHeader title="My Dashboard" />
        <Card>
          <EmptyState title="No contractor profile linked" description="This account isn't linked to a contractor profile yet." />
        </Card>
      </>
    );
  }

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title="My Dashboard" />
        <LoadingState label="Loading your dashboard…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="My Dashboard" />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { contractor, projects, riskNotifications, performance } = state.data;
  const activeProjects = projects.filter((p) => p.status === 'In Progress');

  return (
    <>
      <PageHeader title={`Welcome, ${contractor.name}`} description={`Primary site: ${contractor.primaryMineName}`} />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Active Projects" value={activeProjects.length} icon={FolderKanban} />
        <StatCard label="Workers" value={contractor.workers} icon={Users} />
        <StatCard label="Compliance %" value={`${contractor.complianceRate}%`} icon={ShieldCheck} tone="success" />
        <StatCard label="Open Actions" value={contractor.openActions} icon={Wrench} tone="warning" />
        <StatCard label="Risk Level" value={contractor.riskLevel} icon={Gauge} tone={contractor.riskLevel === 'HIGH' ? 'danger' : 'neutral'} />
        <StatCard label="Overall Performance" value={`${performance?.overall ?? '—'}%`} icon={TrendingUp} tone="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padded={false}>
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-ink-900">Active Projects</h3>
          </div>
          {activeProjects.length === 0 ? (
            <EmptyState title="No active projects" />
          ) : (
            <ul className="divide-y divide-border">
              {activeProjects.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                    <p className="text-xs text-ink-500">
                      {p.mineName} · Due {formatDate(p.endDate)}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-ink-500">{p.compliance}%</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card padded={false}>
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-ink-900">Recent Risk Notifications</h3>
          </div>
          {riskNotifications.length === 0 ? (
            <EmptyState title="No recent risk notifications" />
          ) : (
            <ul className="divide-y divide-border">
              {riskNotifications.slice(0, 4).map((n) => (
                <li key={n.id} className="px-5 py-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${n.delta > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                      {n.delta > 0 ? '+' : ''}
                      {n.delta} risk points
                    </span>
                    <span className="text-xs text-ink-500">{formatDate(n.date)}</span>
                  </div>
                  <p className="text-sm text-ink-700">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
