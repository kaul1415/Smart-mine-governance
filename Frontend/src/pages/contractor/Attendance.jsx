import { useEffect, useState } from 'react';
import { Plus, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function Attendance() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', records: [], error: null });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), workers: '', present: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', records: [], error: null });
    try {
      const records = await contractorService.getAttendance(contractorId);
      setState({ status: 'success', records, error: null });
    } catch (err) {
      setState({ status: 'error', records: [], error: err.message || 'Unable to load attendance.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const workers = Number(form.workers);
    const present = Number(form.present);
    if (!workers || present > workers) return;
    setSubmitting(true);
    try {
      await contractorService.recordAttendance(contractorId, {
        date: new Date(form.date).toISOString(),
        workers,
        present,
        absent: workers - present,
      });
      setForm({ date: new Date().toISOString().slice(0, 10), workers: '', present: '' });
      setShowForm(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'date', header: 'Date', render: (row) => formatDate(row.date) },
    { key: 'workers', header: 'Workers' },
    { key: 'present', header: 'Present' },
    { key: 'absent', header: 'Absent' },
    { key: 'pct', header: 'Attendance %', render: (row) => `${Math.round((row.present / row.workers) * 100)}%` },
  ];

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Daily worker attendance recorded for your projects."
        actions={
          <Button icon={Plus} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Record Attendance'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-4 max-w-lg">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Total Workers</label>
              <input type="number" min="0" value={form.workers} onChange={(e) => setForm((f) => ({ ...f, workers: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-500">Present</label>
              <input type="number" min="0" value={form.present} onChange={(e) => setForm((f) => ({ ...f, present: e.target.value }))} className={inputClass} required />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" size="sm" icon={Send} disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <DataTable columns={columns} data={state.records} rowKey={(row) => row.id} status={state.status} error={state.error} onRetry={load} emptyTitle="No attendance records yet" />
    </>
  );
}
