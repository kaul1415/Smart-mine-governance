import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Loader2, CheckCircle2, Eye, Wrench } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import FileUploader from '../../components/common/FileUploader.jsx';
import DocumentExtractedDataPanel from '../../components/documents/DocumentExtractedDataPanel.jsx';
import { documentService } from '../../services/documentService.js';
import { correctiveActionService } from '../../services/correctiveActionService.js';
import { mineService } from '../../services/mineService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_META = {
  Processing: { icon: Loader2, className: 'animate-spin text-status-warning', label: 'Processing' },
  Processed: { icon: CheckCircle2, className: 'text-status-success', label: 'Processed' },
};

export default function DocumentIntelligence() {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'loading', documents: [], error: null });
  const [expandedId, setExpandedId] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [mineId, setMineId] = useState('');
  const [mines, setMines] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creatingFor, setCreatingFor] = useState(null);

  async function load() {
    setState({ status: 'loading', documents: [], error: null });
    try {
      const documents = await documentService.getDocuments();
      setState({ status: 'success', documents, error: null });
    } catch (err) {
      setState({ status: 'error', documents: [], error: err.message || 'Unable to load documents.' });
    }
  }

  useEffect(() => {
    load();
    mineService.getMines().then((data) => {
      setMines(data);
      setMineId((v) => v || data[0]?.id || '');
    });
  }, []);

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    try {
      const mine = mines.find((m) => m.id === mineId);
      for (const file of pendingFiles) {
        const doc = await documentService.uploadDocument({
          name: file.name,
          fileType: file.type?.includes('pdf') ? 'PDF' : 'Image',
          mineId,
          mineName: mine?.name || '',
        });
        await load();
        // Simulate the backend OCR/AI pipeline completing.
        documentService.processDocument(doc.id).then(load);
      }
      setPendingFiles([]);
      setShowUploader(false);
    } finally {
      setUploading(false);
      await load();
    }
  }

  async function handleCreateCorrectiveActions(doc) {
    setCreatingFor(doc.id);
    try {
      for (const suggestion of doc.extractedData.suggestedCorrectiveActions) {
        await correctiveActionService.createCorrectiveAction({
          issue: suggestion.issue,
          recommendation: suggestion.recommendation,
          mineId: doc.mineId,
          mineName: doc.mineName,
          assignedTo: 'Unassigned',
          priority: suggestion.priority,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      navigate('/corrective-actions');
    } finally {
      setCreatingFor(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Document Intelligence"
        description="Upload scanned reports or photos for OCR/AI extraction. Processing always happens on the backend — this view only displays the result."
        actions={
          <Button icon={UploadCloud} onClick={() => setShowUploader((v) => !v)}>
            {showUploader ? 'Cancel' : 'Upload Document'}
          </Button>
        }
      />

      {showUploader && (
        <Card className="mb-4 max-w-lg">
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-ink-500">Mine</label>
            <select
              value={mineId}
              onChange={(e) => setMineId(e.target.value)}
              className="w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 focus:border-brand-600"
            >
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <FileUploader files={pendingFiles} onChange={setPendingFiles} label="Upload PDF or Image" />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleUpload} disabled={uploading || pendingFiles.length === 0}>
              {uploading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        </Card>
      )}

      {state.status === 'loading' && <LoadingState label="Loading documents…" />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
      {state.status === 'success' && state.documents.length === 0 && (
        <Card>
          <EmptyState title="No documents uploaded yet" icon={FileText} />
        </Card>
      )}

      {state.status === 'success' && state.documents.length > 0 && (
        <div className="space-y-3">
          {state.documents.map((doc) => {
            const meta = STATUS_META[doc.status] || STATUS_META.Processed;
            const StatusIcon = meta.icon;
            const expanded = expandedId === doc.id;
            return (
              <Card key={doc.id} padded={false}>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <FileText size={16} className="shrink-0 text-ink-500" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-900">{doc.name}</p>
                      <p className="text-xs text-ink-500">
                        {doc.mineName} · {formatDate(doc.uploadedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-ink-700">
                      <StatusIcon size={13} className={meta.className} /> {meta.label}
                    </span>
                    {doc.status === 'Processed' && (
                      <Button variant="secondary" size="sm" icon={Eye} onClick={() => setExpandedId(expanded ? null : doc.id)}>
                        {expanded ? 'Hide' : 'View Extracted Data'}
                      </Button>
                    )}
                  </div>
                </div>

                {expanded && doc.extractedData && (
                  <div className="border-t border-border p-4">
                    <DocumentExtractedDataPanel data={doc.extractedData} />
                    {doc.extractedData.suggestedCorrectiveActions?.length > 0 && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          icon={Wrench}
                          onClick={() => handleCreateCorrectiveActions(doc)}
                          disabled={creatingFor === doc.id}
                        >
                          {creatingFor === doc.id ? 'Creating…' : `Create Corrective Actions (${doc.extractedData.suggestedCorrectiveActions.length})`}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
