import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button.jsx';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function FieldAttendanceForm({ mines, onSubmit }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [workers, setWorkers] = useState('');
  const [present, setPresent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const w = Number(workers);
    const p = Number(present);
    if (!w || p > w) return;
    setSubmitting(true);
    try {
      const mine = mines.find((m) => m.id === mineId);
      await onSubmit({ mineId, mineName: mine?.name || '', workers: w, present: p, absent: w - p });
      setWorkers('');
      setPresent('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Mine</label>
        <select value={mineId} onChange={(e) => setMineId(e.target.value)} className={inputClass}>
          {mines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Total Workers</label>
          <input type="number" min="0" value={workers} onChange={(e) => setWorkers(e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Present</label>
          <input type="number" min="0" value={present} onChange={(e) => setPresent(e.target.value)} className={inputClass} required />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" icon={Send} disabled={submitting}>
          {submitting ? 'Saving…' : 'Record Attendance'}
        </Button>
      </div>
    </form>
  );
}
