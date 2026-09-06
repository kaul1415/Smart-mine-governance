import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { inspectionService } from '../../services/inspectionService.js';
import { mineService } from '../../services/mineService.js';
import { INSPECTION_TYPES } from '../../data/mockData.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function NewInspection() {
  const navigate = useNavigate();
  const [mines, setMines] = useState([]);
  const [form, setForm] = useState({
    mineId: '',
    inspectionType: INSPECTION_TYPES[0],
    inspector: '',
    date: new Date().toISOString().slice(0, 16),
    checklistText: 'General housekeeping\nSafety signage\nEmergency exits',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    mineService.getMines().then((data) => {
      setMines(data);
      setForm((f) => ({ ...f, mineId: f.mineId || data[0]?.id || '' }));
    });
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const mine = mines.find((m) => m.id === form.mineId);
      const inspection = await inspectionService.createInspection({
        mineId: form.mineId,
        mineName: mine?.name || '',
        inspectionType: form.inspectionType,
        inspector: form.inspector,
        date: new Date(form.date).toISOString(),
        checklist: form.checklistText.split('\n').map((l) => l.trim()).filter(Boolean),
      });
      navigate(`/inspections/${inspection.id}`);
    } catch (err) {
      setError(err.message || 'Unable to create this inspection. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="New Inspection" breadcrumbs={[{ label: 'Inspections', path: '/inspections' }, { label: 'New Inspection' }]} />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Mine</label>
              <select value={form.mineId} onChange={(e) => update('mineId', e.target.value)} className={inputClass}>
                {mines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Inspection Type</label>
              <select value={form.inspectionType} onChange={(e) => update('inspectionType', e.target.value)} className={inputClass}>
                {INSPECTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Inspector</label>
              <input
                type="text"
                value={form.inspector}
                onChange={(e) => update('inspector', e.target.value)}
                placeholder="Inspector name"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Date & Time</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Checklist</label>
            <textarea
              value={form.checklistText}
              onChange={(e) => update('checklistText', e.target.value)}
              rows={4}
              placeholder="One checklist item per line"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink-500">One item per line.</p>
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => navigate('/inspections')}>
              Cancel
            </Button>
            <Button type="submit" icon={Send} disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Inspection'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
