import { useEffect, useState, useCallback } from 'react';
import { Mountain, Flag, ShieldAlert, ShieldCheck, Wrench, AlertTriangle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import ComplianceTrendChart from '../../components/dashboard/ComplianceTrendChart.jsx';
import FlagsByCategoryChart from '../../components/dashboard/FlagsByCategoryChart.jsx';
import HighRiskMinesList from '../../components/dashboard/HighRiskMinesList.jsx';
import RecentFlagsList from '../../components/dashboard/RecentFlagsList.jsx';
import RecentResponsesList from '../../components/dashboard/RecentResponsesList.jsx';
import OverdueActionsList from '../../components/dashboard/OverdueActionsList.jsx';
import RecentAlertsList from '../../components/dashboard/RecentAlertsList.jsx';
import RiskMapPreviewCard from '../../components/dashboard/RiskMapPreviewCard.jsx';
import NoticeBoardPreviewCard from '../../components/dashboard/NoticeBoardPreviewCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { mineService } from '../../services/mineService.js';
import { flagService } from '../../services/flagService.js';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { riskService } from '../../services/riskService.js';
import { notificationService } from '../../services/notificationService.js';
import { noticeService } from '../../services/noticeService.js';
import { mockComplianceTrend, mockDashboardStats, mockResponses } from '../../data/mockData.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', data: null, error: null });

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const [mines, highRiskMines, recentFlags, flagsByCategory, overdueActions, alerts, notices] = await Promise.all([
        mineService.getMines(),
        mineService.getHighRiskMines(),
        flagService.getRecentFlags(5),
        flagService.getFlagsByCategory(),
        correctiveActionService.getOverdueActions(),
        notificationService.getRecentAlerts(4),
        noticeService.getNotices(user?.department),
      ]);
      setState({
        status: 'success',
        data: { mines, highRiskMines, recentFlags, flagsByCategory, overdueActions, alerts, notices },
        error: null,
      });
    } catch (err) {
      setState({ status: 'error', data: null, error: err.message || 'Something went wrong.' });
    }
  }, [user?.department]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`} description="Governance overview across all mine sites." />
        <LoadingState label="Loading dashboard…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { mines, highRiskMines, recentFlags, flagsByCategory, overdueActions, alerts, notices } = state.data;
  const stats = mockDashboardStats;

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
        description="Governance overview across all mine sites."
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Mines" value={mines.length} icon={Mountain} to="/mines" />
        <StatCard label="Active Flags" value={stats.activeFlags} icon={Flag} tone="warning" to="/flags" />
        <StatCard
          label="High/Critical Risk Mines"
          value={stats.highCriticalRiskMines}
          icon={ShieldAlert}
          tone="danger"
          to="/risk"
        />
        <StatCard label="Compliance Rate" value={`${stats.complianceRate}%`} icon={ShieldCheck} tone="success" to="/compliance" />
        <StatCard label="Open Corrective Actions" value={stats.openCorrectiveActions} icon={Wrench} to="/corrective-actions" />
        <StatCard
          label="Overdue Actions"
          value={stats.overdueActions}
          icon={AlertTriangle}
          tone="danger"
          to="/corrective-actions"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ComplianceTrendChart data={mockComplianceTrend} />
        <FlagsByCategoryChart data={flagsByCategory} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HighRiskMinesList mines={highRiskMines} />
        <RecentFlagsList flags={recentFlags} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentResponsesList responses={mockResponses} />
        <OverdueActionsList actions={overdueActions} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentAlertsList alerts={alerts} />
        <RiskMapPreviewCard mines={highRiskMines} />
      </div>

      <div className="mt-6">
        <NoticeBoardPreviewCard notices={notices} />
      </div>
    </>
  );
}
