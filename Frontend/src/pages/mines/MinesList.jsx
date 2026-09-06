import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import { mineService } from '../../services/mineService.js';

export default function MinesList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', mines: [], error: null });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setState({ status: 'loading', mines: [], error: null });
    try {
      const mines = await mineService.getMines();
      setState({ status: 'success', mines, error: null });
    } catch (err) {
      setState({ status: 'error', mines: [], error: err.message || 'Unable to load mines.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const statusOptions = Array.from(new Set(state.mines.map((m) => m.status))).map((s) => ({ value: s, label: s }));

  const filtered = state.mines.filter((m) => {
    if (status && m.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.location.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    { key: 'name', header: 'Mine' },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status' },
    { key: 'complianceRate', header: 'Compliance', render: (row) => `${row.complianceRate}%` },
    { key: 'riskLevel', header: 'Risk', render: (row) => <RiskBadge level={row.riskLevel} score={row.riskScore} /> },
    { key: 'openFlags', header: 'Open Flags' },
    { key: 'openCorrectiveActions', header: 'Open Actions' },
  ];

  return (
    <>
      <PageHeader title="Mines" description="All mine sites under governance monitoring." />
      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search mine name or location…' }}
        selects={[{ key: 'status', label: 'All Statuses', value: status, onChange: setStatus, options: statusOptions }]}
      />
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/mines/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No mines found"
      />
    </>
  );
}
