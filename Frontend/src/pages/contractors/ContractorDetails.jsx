import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import { Users, ShieldCheck, Wrench, Gauge } from 'lucide-react';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'projects', label: 'Projects' },
  { key: 'performance', label: 'Performance' },
  { key: 'safety', label: 'Safety' },
  { key: 'documents', label: 'Documents' },
  { key: 'risk', label: 'Risk' },
];

export default function ContractorDetails() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const contractor = await contractorService.getContractorById(id);
      if (!contractor) {
        setState({ status: 'success', data: { contractor: null }, error: null });
        return;
      }
      const [projects, performance, safety, documents, riskNotifications] = await Promise.all([
        contractorService.getProjects(id),
        contractorService.getPerformance(id),
        contractorService.getSafetyRequirements(id),
        contractorService.getDocuments(id),
        contractorService.getRiskNotifications(id),
      ]);
      setState({ status: 'success', data: { contractor, projects, performance, safety, documents, riskNotifications }, error: null });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Unable to load this contractor.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Contractors', path: '/contractors' }, { label: id }]} />
        <LoadingState label="Loading contractor…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Contractors', path: '/contractors' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { contractor } = state.data;

  if (!contractor) {
    return (
      <>
        <PageHeader title="Contractor not found" breadcrumbs={[{ label: 'Contractors', path: '/contractors' }]} />
        <Card>
          <EmptyState title="This contractor doesn't exist" description={`No contractor found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  const { projects, performance, safety, documents, riskNotifications } = state.data;

  return (
    <>
      <PageHeader
        title={contractor.name}
        description={`Primary site: ${contractor.primaryMineName}`}
        breadcrumbs={[{ label: 'Contractors', path: '/contractors' }, { label: contractor.name }]}
        actions={<RiskBadge level={contractor.riskLevel} score={contractor.riskScore} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Workers" value={contractor.workers} icon={Users} />
        <StatCard label="Compliance" value={`${contractor.complianceRate}%`} icon={ShieldCheck} tone="success" />
        <StatCard label="Open Actions" value={contractor.openActions} icon={Wrench} tone="warning" />
        <StatCard label="Overall Performance" value={`${performance?.overall ?? '—'}%`} icon={Gauge} />
      </div>

      <Card padded={false}>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        <div className="p-5">
          {tab === 'overview' && (
            <p className="text-sm text-ink-700">
              <span className="font-medium text-ink-900">{contractor.name}</span> operates primarily at{' '}
              <Link to={`/mines/${contractor.primaryMineId}`} className="text-brand-700 hover:underline">
                {contractor.primaryMineName}
              </Link>{' '}
              with {contractor.workers} workers, a {contractor.complianceRate}% compliance rate, and {contractor.openActions} open
              corrective action(s).
            </p>
          )}

          {tab === 'projects' && (
            <div>
              {projects.length === 0 ? (
                <EmptyState title="No projects on file" />
              ) : (
                <ul className="divide-y divide-border">
                  {projects.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                        <p className="text-xs text-ink-500">
                          {p.mineName} · {formatDate(p.startDate)} – {formatDate(p.endDate)}
                        </p>
                      </div>
                      <StatusBadge status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'performance' && (
            <div>
              {performance ? (
                <div className="max-w-md space-y-3">
                  {Object.entries(performance)
                    .filter(([key]) => key !== 'overall')
                    .map(([key, value]) => (
                      <ProgressBar key={key} label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())} value={value} />
                    ))}
                </div>
              ) : (
                <EmptyState title="No performance data available" />
              )}
            </div>
          )}

          {tab === 'safety' && (
            <div>
              {safety.length === 0 ? (
                <EmptyState title="No safety requirements tracked" />
              ) : (
                <ul className="divide-y divide-border">
                  {safety.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="text-ink-900">{s.requirement}</span>
                      <span className="text-xs text-ink-500">{s.status} · {formatDate(s.expiryDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'documents' && (
            <div>
              {documents.length === 0 ? (
                <EmptyState title="No documents on file" />
              ) : (
                <ul className="divide-y divide-border">
                  {documents.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="truncate text-ink-900">{d.name}</span>
                      <span className="shrink-0 text-xs text-ink-500">{d.type} · {formatDate(d.uploadedDate)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'risk' && (
            <div>
              {riskNotifications.length === 0 ? (
                <EmptyState title="No risk notifications on file" />
              ) : (
                <ul className="space-y-2.5">
                  {riskNotifications.map((n) => (
                    <li key={n.id} className="rounded border border-border p-3 text-sm">
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`font-medium ${n.delta > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                          {n.delta > 0 ? '+' : ''}
                          {n.delta} risk points
                        </span>
                        <span className="text-xs text-ink-500">{formatDate(n.date)}</span>
                      </div>
                      <p className="text-ink-700">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}
