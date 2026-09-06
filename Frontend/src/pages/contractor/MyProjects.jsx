import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

export default function MyProjects() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', projects: [], error: null });

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', projects: [], error: null });
    try {
      const projects = await contractorService.getProjects(contractorId);
      setState({ status: 'success', projects, error: null });
    } catch (err) {
      setState({ status: 'error', projects: [], error: err.message || 'Unable to load your projects.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  const columns = [
    { key: 'name', header: 'Project' },
    { key: 'mineName', header: 'Mine' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'startDate', header: 'Start Date', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', header: 'End Date', render: (row) => formatDate(row.endDate) },
    { key: 'compliance', header: 'Compliance', render: (row) => `${row.compliance}%` },
  ];

  return (
    <>
      <PageHeader title="My Projects" description="Projects assigned to your organization." />
      <DataTable
        columns={columns}
        data={state.projects}
        rowKey={(row) => row.id}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No projects assigned yet"
      />
    </>
  );
}
