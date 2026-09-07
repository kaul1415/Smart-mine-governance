import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button.jsx';
import FileUploader from '../common/FileUploader.jsx';
import { OBSERVATION_CATEGORIES } from '../../data/mockData.js';
import { SEVERITIES } from '../../utils/constants.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function FieldObservationForm({ mines, onSubmit }) {
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [category, setCategory] = useState(OBSERVATION_CATEGORIES[0]);
  const [severity, setSeverity] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState([]);
  const [useGps, setUseGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const mine = mines.find((m) => m.id === mineId);
      await onSubmit({
        mineId,
        mineName: mine?.name || '',
        category,
        severity,
        description,
        location: location || (useGps ? 'GPS-tagged location' : ''),
        comments,
        photoCount: photos.length,
      });
      setDescription('');
      setLocation('');
      setComments('');
      setPhotos([]);
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

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} required />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {OBSERVATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={inputClass}>
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Location</label>
        <div className="flex gap-2">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          <Button type="button" variant="secondary" size="sm" onClick={() => setUseGps(true)} className="shrink-0">
            Use GPS
          </Button>
        </div>
        {useGps && !location && <p className="mt-1 text-xs text-ink-500">Location will be captured from device GPS on submit.</p>}
      </div>

      <FileUploader files={photos} onChange={setPhotos} label="Photo" />

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Comments (optional)</label>
        <input type="text" value={comments} onChange={(e) => setComments(e.target.value)} className={inputClass} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" icon={Send} disabled={submitting}>
          {submitting ? 'Saving…' : 'Submit Observation'}
        </Button>
      </div>
    </form>
  );
}
