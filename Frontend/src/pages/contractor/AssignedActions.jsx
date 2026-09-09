import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { formatDate, isOverdue } from '../../utils/format.js';

export default function AssignedActions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', actions: [], error: null });

  async function load() {
    setState({ status: 'loading', actions: [], error: null });
    try {
      const all = await correctiveActionService.getCorrectiveActions();
      const mine = all.filter((a) => a.assignedTo === user?.name);
      setState({ status: 'success', actions: mine, error: null });
    } catch (err) {
      setState({ status: 'error', actions: [], error: err.message || 'Unable to load your assigned actions.' });
    }
  }

  useEffect(() => {
    load();
  }, [user?.name]);

  const columns = [
    { key: 'id', header: 'Action ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.id}</span> },
    { key: 'issue', header: 'Issue' },
    { key: 'mineName', header: 'Mine' },
    { key: 'priority', header: 'Priority', render: (row) => <RiskBadge level={row.priority} /> },
    {
      key: 'dueDate',
      header: 'Deadline',
      render: (row) => (
        <span className={isOverdue(row.dueDate, row.status) ? 'font-medium text-status-danger' : ''}>{formatDate(row.dueDate)}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader title="Assigned Corrective Actions" description="Remediation tasks assigned to your organization." />
      <DataTable
        columns={columns}
        data={state.actions}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/corrective-actions/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No corrective actions assigned to you"
      />
    </>
  );
}
