import { useEffect, useState } from 'react';
import { Plus, ArrowRight, CheckCircle2, Eye } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import DataTable from '../../components/common/DataTable.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import DocumentUploader from '../../components/common/DocumentUploader.jsx';
import ExtractedReportInfoPanel from '../../components/contractor/ExtractedReportInfoPanel.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { contractorService } from '../../services/contractorService.js';
import { CONTRACTOR_REPORT_TYPES } from '../../data/mockData.js';
import { formatDate } from '../../utils/format.js';

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function MyReports() {
  const { user } = useAuth();
  const contractorId = user?.contractorId;
  const [state, setState] = useState({ status: 'loading', reports: [], error: null });
  const [projects, setProjects] = useState([]);
  const [type, setType] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Submission form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reportType: CONTRACTOR_REPORT_TYPES[0], projectId: '', reportDate: new Date().toISOString().slice(0, 10), comment: '' });
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | uploading | processing | success | error
  const [uploadError, setUploadError] = useState(null);
  const [draftReport, setDraftReport] = useState(null); // report once uploaded+processed, pending final submit
  const [finalizing, setFinalizing] = useState(false);

  async function load() {
    if (!contractorId) return;
    setState({ status: 'loading', reports: [], error: null });
    try {
      const [reports, projectList] = await Promise.all([
        contractorService.getReports(contractorId),
        contractorService.getProjects(contractorId),
      ]);
      setState({ status: 'success', reports, error: null });
      setProjects(projectList);
      setForm((f) => ({ ...f, projectId: f.projectId || projectList[0]?.id || '' }));
    } catch (err) {
      setState({ status: 'error', reports: [], error: err.message || 'Unable to load reports.' });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractorId]);

  function resetForm() {
    setForm({ reportType: CONTRACTOR_REPORT_TYPES[0], projectId: projects[0]?.id || '', reportDate: new Date().toISOString().slice(0, 10), comment: '' });
    setFile(null);
    setUploadStatus('idle');
    setUploadError(null);
    setDraftReport(null);
  }

  async function handleUploadAndProcess(e) {
    e.preventDefault();
    if (!file) return;
    setUploadStatus('uploading');
    setUploadError(null);
    try {
      const project = projects.find((p) => p.id === form.projectId);
      const uploaded = await contractorService.uploadReport(contractorId, {
        reportType: form.reportType,
        projectId: form.projectId,
        projectName: project?.name || '',
        reportDate: new Date(form.reportDate).toISOString(),
        comment: form.comment,
        document: { name: file.name, size: file.size, type: file.type },
      });
      setUploadStatus('processing');
      const processed = await contractorService.processReport(uploaded.id, user?.name);
      setDraftReport(processed);
      setUploadStatus('success');
    } catch (err) {
      setUploadStatus('error');
      setUploadError(err.message || 'Unable to process this document. Please try again.');
    }
  }

  async function handleFinalSubmit() {
    if (!draftReport) return;
    setFinalizing(true);
    try {
      await contractorService.finalizeReport(draftReport.id);
      setShowForm(false);
      resetForm();
      await load();
    } finally {
      setFinalizing(false);
    }
  }

  const filtered = state.reports.filter((r) => !type || r.reportType === type);

  const columns = [
    { key: 'id', header: 'Report ID', render: (row) => <span className="font-mono text-xs text-ink-900">{row.id}</span> },
    { key: 'reportType', header: 'Type' },
    { key: 'projectName', header: 'Project' },
    { key: 'submittedDate', header: 'Submission Date', render: (row) => (row.submittedDate ? formatDate(row.submittedDate) : '—') },
    { key: 'processingStatus', header: 'Processing Status', render: (row) => <StatusBadge status={row.processingStatus} /> },
    { key: 'reportStatus', header: 'Report Status', render: (row) => <StatusBadge status={row.reportStatus} /> },
    { key: 'document', header: 'Document', render: (row) => <span className="truncate text-xs text-ink-500">{row.document?.name || '—'}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
          className="flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
        >
          <Eye size={12} /> {expandedId === row.id ? 'Hide' : 'View'}
        </button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="My Reports"
        description="Submit reports by uploading the document — OCR extracts the details, you review before final submission."
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setShowForm((v) => !v);
              if (showForm) resetForm();
            }}
          >
            {showForm ? 'Cancel' : 'Submit Report'}
          </Button>
        }
      />

      {showForm && (
        <Card className="mb-4 max-w-xl">
          {!draftReport ? (
            <form onSubmit={handleUploadAndProcess} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-500">Report Type</label>
                  <select value={form.reportType} onChange={(e) => setForm((f) => ({ ...f, reportType: e.target.value }))} className={inputClass}>
                    {CONTRACTOR_REPORT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-500">Project</label>
                  <select value={form.projectId} onChange={(e) => setForm((f) => ({ ...f, projectId: e.target.value }))} className={inputClass} required>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Report Date</label>
                <input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => setForm((f) => ({ ...f, reportDate: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-500">Comment (optional)</label>
                <input
                  type="text"
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="Short note about this report"
                  className={inputClass}
                />
              </div>

              <DocumentUploader
                file={file}
                onSelect={setFile}
                onRemove={() => setFile(null)}
                status={uploadStatus}
                errorMessage={uploadError}
              />
              <p className="text-xs text-ink-500">
                The report content comes from the uploaded document — there's no separate text editor. OCR/text
                extraction happens on the backend/ML service; this is a prototype stand-in for that step.
              </p>

              <div className="flex justify-end">
                <Button type="submit" size="sm" icon={ArrowRight} disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'processing'}>
                  {uploadStatus === 'uploading' ? 'Uploading…' : uploadStatus === 'processing' ? 'Processing…' : 'Upload & Process'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-status-success">
                <CheckCircle2 size={15} /> OCR completed — review before submitting.
              </div>
              <ExtractedReportInfoPanel data={draftReport.extractedData} />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={resetForm}>
                  Start Over
                </Button>
                <Button size="sm" onClick={handleFinalSubmit} disabled={finalizing}>
                  {finalizing ? 'Submitting…' : 'Submit Report'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <FilterBar
        selects={[{ key: 'type', label: 'All Report Types', value: type, onChange: setType, options: CONTRACTOR_REPORT_TYPES.map((t) => ({ value: t, label: t })) }]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        status={state.status}
        error={state.error}
        onRetry={load}
        emptyTitle="No reports submitted yet"
        footer={
          expandedId && (
            <div className="border-t border-border p-4">
              <ExtractedReportInfoPanel data={state.reports.find((r) => r.id === expandedId)?.extractedData} />
            </div>
          )
        }
      />
    </>
  );
}
