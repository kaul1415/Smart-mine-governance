import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { CORRECTIVE_ACTION_STATUSES, PRIORITIES } from '../../data/mockData.js';
import { formatDate, isOverdue } from '../../utils/format.js';

export default function CorrectiveActionsList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', actions: [], error: null });
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setState({ status: 'loading', actions: [], error: null });
    try {
      const actions = await correctiveActionService.getCorrectiveActions();
      setState({ status: 'success', actions, error: null });
    } catch (err) {
      setState({ status: 'error', actions: [], error: err.message || 'Unable to load corrective actions.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.actions.filter((a) => {
    if (priority && a.priority !== priority) return false;
    if (status && a.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.id.toLowerCase().includes(q) && !a.issue.toLowerCase().includes(q) && !a.mineName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    { key: 'id', header: 'Action ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.id}</span> },
    { key: 'issue', header: 'Issue' },
    { key: 'mineName', header: 'Mine' },
    { key: 'assignedTo', header: 'Assigned To' },
    { key: 'priority', header: 'Priority', render: (row) => <RiskBadge level={row.priority} /> },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (row) => (
        <span className={isOverdue(row.dueDate, row.status) ? 'font-medium text-status-danger' : ''}>{formatDate(row.dueDate)}</span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader title="Corrective Actions" description="Remediation tasks raised against flags and inspection findings." />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search action ID, issue, mine…' }}
        selects={[
          { key: 'priority', label: 'All Priorities', value: priority, onChange: setPriority, options: PRIORITIES.map((p) => ({ value: p, label: p })) },
          { key: 'status', label: 'All Statuses', value: status, onChange: setStatus, options: CORRECTIVE_ACTION_STATUSES.map((s) => ({ value: s, label: s })) },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/corrective-actions/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No corrective actions found"
      />
    </>
  );
}
