import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { complianceService } from '../../services/complianceService.js';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_STATUSES } from '../../data/mockData.js';
import { formatDate } from '../../utils/format.js';

export default function ComplianceList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', items: [], error: null });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setState({ status: 'loading', items: [], error: null });
    try {
      const items = await complianceService.getComplianceRequirements();
      setState({ status: 'success', items, error: null });
    } catch (err) {
      setState({ status: 'error', items: [], error: err.message || 'Unable to load compliance requirements.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const c = { Compliant: 0, 'Due Soon': 0, Overdue: 0, 'Non-Compliant': 0 };
    state.items.forEach((i) => {
      c[i.status] = (c[i.status] || 0) + 1;
    });
    return c;
  }, [state.items]);

  const filtered = state.items.filter((i) => {
    if (category && i.category !== category) return false;
    if (status && i.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.requirement.toLowerCase().includes(q) && !i.mineName.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    { key: 'requirement', header: 'Requirement' },
    { key: 'mineName', header: 'Mine' },
    { key: 'category', header: 'Category' },
    { key: 'responsiblePerson', header: 'Responsible Person' },
    { key: 'dueDate', header: 'Due Date', render: (row) => formatDate(row.dueDate) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} tone={STATUS_TONE[row.status]} /> },
  ];

  return (
    <>
      <PageHeader title="Compliance" description="Statutory and internal compliance requirements across all mines." />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Compliant" value={counts.Compliant} icon={ShieldCheck} tone="success" />
        <StatCard label="Due Soon" value={counts['Due Soon']} icon={Clock} tone="warning" />
        <StatCard label="Overdue" value={counts.Overdue} icon={AlertTriangle} tone="danger" />
        <StatCard label="Non-Compliant" value={counts['Non-Compliant']} icon={ShieldAlert} tone="danger" />
      </div>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search requirement or mine…' }}
        selects={[
          { key: 'category', label: 'All Categories', value: category, onChange: setCategory, options: COMPLIANCE_CATEGORIES.map((c) => ({ value: c, label: c })) },
          { key: 'status', label: 'All Statuses', value: status, onChange: setStatus, options: COMPLIANCE_STATUSES.map((s) => ({ value: s, label: s })) },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/compliance/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No compliance requirements found"
      />
    </>
  );
}

const STATUS_TONE = {
  Compliant: 'success',
  'Due Soon': 'warning',
  Overdue: 'danger',
  'Non-Compliant': 'danger',
};
