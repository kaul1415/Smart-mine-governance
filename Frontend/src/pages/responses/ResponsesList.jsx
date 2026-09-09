import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { responseService } from '../../services/responseService.js';
import { formatDateTime } from '../../utils/format.js';

const RESPONSE_TYPES = ['Issue Approved', 'Action Initiated', 'Action Taken', 'Resolved', 'Dismissed'];

export default function ResponsesList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', responses: [], error: null });
  const [search, setSearch] = useState('');
  const [responseType, setResponseType] = useState('');

  async function load() {
    setState({ status: 'loading', responses: [], error: null });
    try {
      const responses = await responseService.getResponses();
      setState({ status: 'success', responses, error: null });
    } catch (err) {
      setState({ status: 'error', responses: [], error: err.message || 'Unable to load responses.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = state.responses.filter((r) => {
    if (responseType && r.responseType !== responseType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!r.flagId.toLowerCase().includes(q) && !r.authority.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const columns = [
    { key: 'flagId', header: 'Ticket ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.flagId}</span> },
    { key: 'authority', header: 'Authority' },
    { key: 'responseType', header: 'Response Type' },
    { key: 'date', header: 'Date', render: (row) => formatDateTime(row.date) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader title="Regulatory Responses" description="Official responses recorded against governance flags." />
      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search ticket ID or authority…' }}
        selects={[
          {
            key: 'responseType',
            label: 'All Response Types',
            value: responseType,
            onChange: setResponseType,
            options: RESPONSE_TYPES.map((t) => ({ value: t, label: t })),
          },
        ]}
      />
      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/responses/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No responses found"
        emptyDescription="Official responses to flags will appear here once authorities act on a ticket."
      />
    </>
  );
}
