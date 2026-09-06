import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { flagService } from '../../services/flagService.js';
import { FLAG_CATEGORIES, FLAG_STATUSES } from '../../data/mockData.js';
import { SEVERITIES } from '../../utils/constants.js';
import { formatDate } from '../../utils/format.js';

const PAGE_SIZE = 8;

const SEVERITY_DOT = {
  LOW: 'bg-risk-low',
  MEDIUM: 'bg-risk-medium',
  HIGH: 'bg-risk-high',
  CRITICAL: 'bg-risk-critical',
};

export default function FlagsList() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', flags: [], error: null });
  const [search, setSearch] = useState('');
  const [mine, setMine] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [page, setPage] = useState(1);

  async function load() {
    setState({ status: 'loading', flags: [], error: null });
    try {
      const flags = await flagService.getFlags();
      setState({ status: 'success', flags, error: null });
    } catch (err) {
      setState({ status: 'error', flags: [], error: err.message || 'Unable to load flags.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, mine, category, severity, status, fromDate]);

  const filtered = useMemo(() => {
    return state.flags.filter((f) => {
      if (mine && f.mineId !== mine) return false;
      if (category && f.category !== category) return false;
      if (severity && f.severity !== severity) return false;
      if (status && f.status !== status) return false;
      if (fromDate && new Date(f.createdAt) < new Date(fromDate)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!f.id.toLowerCase().includes(q) && !f.mineName.toLowerCase().includes(q) && !f.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [state.flags, search, mine, category, severity, status]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const mineOptions = useMemo(() => {
    const seen = new Map();
    state.flags.forEach((f) => seen.set(f.mineId, f.mineName));
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [state.flags]);

  const columns = [
    { key: 'id', header: 'Ticket ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.id}</span> },
    { key: 'category', header: 'Category' },
    { key: 'mineName', header: 'Mine' },
    { key: 'location', header: 'Location' },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => (
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[row.severity]}`} />
          {row.severity}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    { key: 'assignedAuthority', header: 'Assigned Authority' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Flags"
        description="Field reports and complaints tracked as governance tickets."
        actions={
          <Button icon={Plus} onClick={() => navigate('/flags/new')}>
            New Flag
          </Button>
        }
      />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search ticket ID, mine, description…' }}
        dateFilter={{ value: fromDate, onChange: setFromDate, label: 'Since' }}
        selects={[
          { key: 'mine', label: 'All Mines', value: mine, onChange: setMine, options: mineOptions },
          {
            key: 'category',
            label: 'All Categories',
            value: category,
            onChange: setCategory,
            options: FLAG_CATEGORIES.map((c) => ({ value: c, label: c })),
          },
          {
            key: 'severity',
            label: 'All Severities',
            value: severity,
            onChange: setSeverity,
            options: SEVERITIES.map((s) => ({ value: s, label: s })),
          },
          {
            key: 'status',
            label: 'All Statuses',
            value: status,
            onChange: setStatus,
            options: FLAG_STATUSES.map((s) => ({ value: s, label: s })),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={pageItems}
        rowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/flags/${row.id}`)}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No flags found"
        emptyDescription="Try adjusting your filters, or check back after the next field report."
        footer={
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
        }
      />
    </>
  );
}
