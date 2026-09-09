import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import { inspectionService } from '../../services/inspectionService.js';
import { INSPECTION_TYPES, INSPECTION_STATUSES } from '../../data/mockData.js';
import { formatDate } from '../../utils/format.js';

export default function InspectionsList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', inspections: [], error: null });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setState({ status: 'loading', inspections: [], error: null });
    try {
      const inspections = await inspectionService.getInspections();
      setState({ status: 'success', inspections, error: null });
    } catch (err) {
      setState({ status: 'error', inspections: [], error: err.message || 'Unable to load inspections.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.inspections.filter((i) => {
    if (type && i.inspectionType !== type) return false;
    if (status && i.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.id.toLowerCase().includes(q) && !i.mineName.toLowerCase().includes(q) && !i.inspector.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    { key: 'id', header: 'Inspection ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.id}</span> },
    { key: 'mineName', header: 'Mine' },
    { key: 'inspector', header: 'Inspector' },
    { key: 'inspectionType', header: 'Type' },
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'findings', header: 'Findings', render: (row) => row.observations?.length ?? 0 },
    { key: 'riskLevel', header: 'Risk', render: (row) => (row.riskLevel ? <RiskBadge level={row.riskLevel} /> : <span className="text-ink-500">—</span>) },
  ];

  return (
    <>
      <PageHeader
        title="Inspections"
        description="Scheduled and completed field inspections across all mines."
        actions={
          <Button icon={Plus} onClick={() => navigate('/inspections/new')}>
            New Inspection
          </Button>
        }
      />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search inspection ID, mine, inspector…' }}
        selects={[
          { key: 'type', label: 'All Types', value: type, onChange: setType, options: INSPECTION_TYPES.map((t) => ({ value: t, label: t })) },
          { key: 'status', label: 'All Statuses', value: status, onChange: setStatus, options: INSPECTION_STATUSES.map((s) => ({ value: s, label: s })) },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/inspections/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No inspections found"
      />
    </>
  );
}
