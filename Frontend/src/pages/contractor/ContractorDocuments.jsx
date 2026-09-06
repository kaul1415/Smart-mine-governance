import { useEffect, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import FileUploader from '../../components/common/FileUploader.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { formatDate } from '../../utils/format.js';

export default function ContractorDocuments() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', documents: [], error: null });
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', documents: [], error: null });
    try {
      const documents = await contractorService.getDocuments(contractorId);
      setState({ status: 'success', documents, error: null });
    } catch (err) {
      setState({ status: 'error', documents: [], error: err.message || 'Unable to load documents.' });
    }
  }

  useEffect(() => {
    load();
  }, [contractorId]);

  async function handleUpload() {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    try {
      for (const file of pendingFiles) {
        await contractorService.uploadDocument(contractorId, { name: file.name, type: 'Other' });
      }
      setPendingFiles([]);
      setShowUploader(false);
      await load();
    } finally {
      setUploading(false);
    }
  }

  const typeOptions = Array.from(new Set(state.documents.map((d) => d.type))).map((t) => ({ value: t, label: t }));
  const filtered = state.documents.filter((d) => {
    if (type && d.type !== type) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Documents"
        description="Certifications, work orders, and reports on file for your organization."
        actions={
          <Button icon={UploadCloud} onClick={() => setShowUploader((v) => !v)}>
            {showUploader ? 'Cancel' : 'Upload'}
          </Button>
        }
      />

      {showUploader && (
        <Card className="mb-4 max-w-lg">
          <FileUploader files={pendingFiles} onChange={setPendingFiles} label="Select files to upload" />
          <div className="mt-3 flex justify-end">
            <Button size="sm" onClick={handleUpload} disabled={uploading || pendingFiles.length === 0}>
              {uploading ? 'Uploading…' : `Upload ${pendingFiles.length || ''}`.trim()}
            </Button>
          </div>
        </Card>
      )}

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search documents…' }}
        selects={[{ key: 'type', label: 'All Types', value: type, onChange: setType, options: typeOptions }]}
      />

      <Card padded={false}>
        {state.status === 'loading' && <LoadingState label="Loading documents…" />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'success' && filtered.length === 0 && <EmptyState title="No documents found" />}
        {state.status === 'success' && filtered.length > 0 && (
          <ul className="divide-y divide-border">
            {filtered.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="flex min-w-0 items-center gap-2 text-sm text-ink-900">
                  <FileText size={15} className="shrink-0 text-ink-500" />
                  <span className="truncate">{doc.name}</span>
                </span>
                <span className="shrink-0 text-xs text-ink-500">
                  {doc.type} · {formatDate(doc.uploadedDate)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
