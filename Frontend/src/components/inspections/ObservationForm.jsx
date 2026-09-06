import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../common/Button.jsx';
import FileUploader from '../common/FileUploader.jsx';
import { OBSERVATION_CATEGORIES } from '../../data/mockData.js';
import { SEVERITIES } from '../../utils/constants.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function ObservationForm({ onSubmit }) {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(OBSERVATION_CATEGORIES[0]);
  const [severity, setSeverity] = useState('MEDIUM');
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [useGps, setUseGps] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        description,
        category,
        severity,
        location: location || (useGps ? 'GPS-tagged location' : ''),
        photoCount: photos.length,
        timestamp: new Date().toISOString(),
        comments,
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
    <form onSubmit={handleSubmit} className="space-y-3 rounded border border-border bg-surface-sunken p-3.5">
      <p className="text-sm font-medium text-ink-900">Add Observation</p>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} required />
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
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Shaft 3, East Gallery"
            className={inputClass}
          />
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
        <Button type="submit" size="sm" icon={Send} disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Observation'}
        </Button>
      </div>
    </form>
  );
}
