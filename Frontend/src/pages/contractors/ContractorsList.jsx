import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import { contractorService } from '../../services/contractorService.js';

export default function ContractorsList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', contractors: [], error: null });
  const [search, setSearch] = useState('');

  async function load() {
    setState({ status: 'loading', contractors: [], error: null });
    try {
      const contractors = await contractorService.getContractors();
      setState({ status: 'success', contractors, error: null });
    } catch (err) {
      setState({ status: 'error', contractors: [], error: err.message || 'Unable to load contractors.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.contractors.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.primaryMineName.toLowerCase().includes(q);
  });

  const columns = [
    { key: 'name', header: 'Contractor' },
    { key: 'primaryMineName', header: 'Primary Mine' },
    { key: 'workers', header: 'Workers' },
    { key: 'complianceRate', header: 'Compliance', render: (row) => `${row.complianceRate}%` },
    { key: 'riskLevel', header: 'Risk', render: (row) => <RiskBadge level={row.riskLevel} score={row.riskScore} /> },
    { key: 'openActions', header: 'Open Actions' },
  ];

  return (
    <>
      <PageHeader title="Contractors" description="All contractor organizations operating across mine sites." />
      <FilterBar search={{ value: search, onChange: setSearch, placeholder: 'Search contractor or mine…' }} />
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/contractors/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No contractors found"
      />
    </>
  );
}
