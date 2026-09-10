import { useState } from 'react';
import { FileText, Loader2, Send } from 'lucide-react';
import Button from '../common/Button.jsx';
import FileUploader from '../common/FileUploader.jsx';
import { FLAG_CATEGORIES } from '../../data/mockData.js';
import { SEVERITIES, REPORTER_TYPES } from '../../utils/constants.js';
import { documentService } from '../../services/documentService.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function FieldFlagForm({ mines, onSubmit }) {
  const [category, setCategory] = useState(FLAG_CATEGORIES[0]);
  const [mineId, setMineId] = useState(mines[0]?.id || '');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [reporterType, setReporterType] = useState(REPORTER_TYPES[0]);
  const [isConfidential, setIsConfidential] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [useGps, setUseGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [ocrMessage, setOcrMessage] = useState(null);

  async function handleExtractText() {
    const file = photos[0];
    if (!file || extracting) return;
    setExtracting(true);
    setOcrMessage(null);
    try {
      const result = await documentService.extractText(file);
      const extractedText = result.text?.trim();
      if (!extractedText) throw new Error('No readable text was found in this file.');
      setDescription((current) => current.trim() ? `${current.trim()}\n\n${extractedText}` : extractedText);
      setOcrMessage(`Text added to Description (${result.ocr_pages || 0} OCR page${result.ocr_pages === 1 ? '' : 's'}). You can edit it before submitting.`);
    } catch (error) {
      setOcrMessage(error.message || 'OCR could not read this file.');
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) return;
    setSubmitting(true);
    try {
      const mine = mines.find((m) => m.id === mineId);
      await onSubmit({
        category,
        mineId,
        mineName: mine?.name || '',
        description,
        location: location || (useGps ? 'GPS-tagged location' : ''),
        severity,
        reporterType,
        isConfidential,
        evidenceCount: photos.length,
      });
      setDescription('');
      setLocation('');
      setPhotos([]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {FLAG_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
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
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} required />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-ink-500">Location</label>
        <div className="flex gap-2">
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Shaft 3" className={inputClass} />
          <Button type="button" variant="secondary" size="sm" onClick={() => setUseGps(true)} className="shrink-0">
            Use GPS
          </Button>
        </div>
        {useGps && !location && <p className="mt-1 text-xs text-ink-500">Location will be captured from device GPS on submit.</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-500">Reporter Type</label>
          <select value={reporterType} onChange={(e) => setReporterType(e.target.value)} className={inputClass}>
            {REPORTER_TYPES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FileUploader files={photos} onChange={setPhotos} />
      {photos.length > 0 && (
        <div className="rounded border border-brand-200 bg-brand-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-ink-900">Read attached file with OCR</p>
              <p className="text-xs text-ink-600">Extracted text will be added to Description, where you can review or edit it.</p>
            </div>
            <Button type="button" variant="secondary" size="sm" icon={extracting ? Loader2 : FileText} onClick={handleExtractText} disabled={extracting} className={extracting ? '[&>svg]:animate-spin' : ''}>
              {extracting ? 'Reading…' : 'Extract text'}
            </Button>
          </div>
          {ocrMessage && <p className={`mt-2 text-xs ${ocrMessage.startsWith('Text added') ? 'text-status-success' : 'text-status-danger'}`}>{ocrMessage}</p>}
        </div>
      )}

      <label className="flex items-start gap-2.5 text-sm text-ink-700">
        <input type="checkbox" checked={isConfidential} onChange={(e) => setIsConfidential(e.target.checked)} className="mt-0.5" />
        <span>Report confidentially (identity hidden from most roles)</span>
      </label>

      <div className="flex justify-end">
        <Button type="submit" icon={Send} disabled={submitting}>
          {submitting ? 'Saving…' : 'Submit Flag'}
        </Button>
      </div>
    </form>
  );
}
