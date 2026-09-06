import { useEffect, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { CONTRACTOR_REPORT_TYPES } from '../../data/mockData.js';
import { formatDateTime } from '../../utils/format.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function MyReports() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', reports: [], error: null });
  const [type, setType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: CONTRACTOR_REPORT_TYPES[0], mineName: '', summary: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', reports: [], error: null });
    try {
      const reports = await contractorService.getReports(contractorId);
      setState({ status: 'success', reports, error: null });
    } catch (err) {
      setState({ status: 'error', reports: [], error: err.message || 'Unable to load reports.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.summary.trim()) return;
    setSubmitting(true);
    try {
      await contractorService.submitReport(contractorId, form);
      setForm({ type: CONTRACTOR_REPORT_TYPES[0], mineName: '', summary: '' });
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = state.reports.filter((r) => !type || r.type === type);

  return (
    <>
      <PageHeader
        title="My Reports"
        description="Daily, safety, incident, and progress reports submitted to governance."
        actions={
          <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'New Report'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-4 max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Report Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className={inputClass}>
                  {CONTRACTOR_REPORT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Mine</label>
                <input
                  type="text"
                  value={form.mineName}
                  onChange={(e) => setForm((f) => ({ ...f, mineName: e.target.value }))}
                  placeholder="e.g. Mine B — Jharia Underground"
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Summary</label>
              <textarea
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                rows={3}
                className={inputClass}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" icon={Send} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <FilterBar
        selects={[{ key: 'type', label: 'All Report Types', value: type, onChange: setType, options: CONTRACTOR_REPORT_TYPES.map((t) => ({ value: t, label: t })) }]}
      />

      <Card padded={false}>
        {state.status === 'loading' && <LoadingState label="Loading reports…" />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'success' && filtered.length === 0 && <EmptyState title="No reports found" />}
        {state.status === 'success' && filtered.length > 0 && (
          <ul className="divide-y divide-border">
            {filtered.map((r) => (
              <li key={r.id} className="px-5 py-3.5">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-ink-900">{r.type}</span>
                  <span className="text-xs text-ink-500">{formatDateTime(r.date)}</span>
                </div>
                <p className="text-sm text-ink-700">{r.summary}</p>
                <p className="mt-1 text-xs text-ink-500">{r.mineName}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
