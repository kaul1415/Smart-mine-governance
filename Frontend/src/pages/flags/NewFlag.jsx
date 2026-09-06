import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import FileUploader from '../../components/common/FileUploader.jsx';
import { flagService } from '../../services/flagService.js';
import { mineService } from '../../services/mineService.js';
import { FLAG_CATEGORIES } from '../../data/mockData.js';
import { SEVERITIES, REPORTER_TYPES } from '../../utils/constants.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function NewFlag() {
  const navigate = useNavigate();
  const [mines, setMines] = useState([]);
  const [form, setForm] = useState({
    category: FLAG_CATEGORIES[0],
    mineId: '',
    description: '',
    location: '',
    severity: 'MEDIUM',
    reporterType: REPORTER_TYPES[0],
    isConfidential: true,
    reporterName: '',
  });
  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
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
      const newFlag = await flagService.createFlag({
        ...form,
        mineName: mine?.name || '',
        evidenceCount: evidence.length,
      });
      setSubmitted(newFlag);
    } catch (err) {
      setError(err.message || 'Unable to submit this report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <PageHeader title="Flag submitted" breadcrumbs={[{ label: 'Flags', path: '/flags' }, { label: 'New Flag' }]} />
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm font-medium text-status-success">Flag submitted successfully.</p>
            <p className="font-mono text-lg text-ink-900">{submitted.id}</p>
            <p className="max-w-sm text-sm text-ink-500">
              This report has been logged as a governance ticket and routed for classification and authority
              assignment.
            </p>
            <div className="mt-2 flex gap-2">
              <Button variant="secondary" onClick={() => navigate(`/flags/${submitted.id}`)}>
                View ticket
              </Button>
              <Button variant="ghost" onClick={() => navigate('/flags')}>
                Back to flags
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Report a Flag" breadcrumbs={[{ label: 'Flags', path: '/flags' }, { label: 'New Flag' }]} />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
                {FLAG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="e.g. Shaft 3, East Gallery"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={4}
              placeholder="Describe what you observed…"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Severity</label>
              <select value={form.severity} onChange={(e) => update('severity', e.target.value)} className={inputClass}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">Reporter Type</label>
              <select value={form.reporterType} onChange={(e) => update('reporterType', e.target.value)} className={inputClass}>
                {REPORTER_TYPES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FileUploader files={evidence} onChange={setEvidence} />

          <div className="rounded border border-border bg-surface-sunken p-3">
            <label className="flex items-start gap-2.5 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={form.isConfidential}
                onChange={(e) => update('isConfidential', e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Report confidentially</span>
                <br />
                <span className="text-xs text-ink-500">
                  Your identity will be hidden from most roles and shown only as "Anonymous / Confidential". It may
                  still be retained internally for authorized verification.
                </span>
              </span>
            </label>
            {!form.isConfidential && (
              <input
                type="text"
                value={form.reporterName}
                onChange={(e) => update('reporterName', e.target.value)}
                placeholder="Your name (shown on this ticket)"
                className={`${inputClass} mt-2`}
              />
            )}
          </div>

          {error && <p className="text-sm text-status-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="secondary" onClick={() => navigate('/flags')}>
              Cancel
            </Button>
            <Button type="submit" icon={Send} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Flag'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
