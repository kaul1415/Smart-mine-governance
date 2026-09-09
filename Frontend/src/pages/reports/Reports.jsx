import { useEffect, useState } from 'react';
import { FileBarChart, Download, Loader2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { reportsService } from '../../services/reportsService.js';
import { mineService } from '../../services/mineService.js';
import { REPORT_TYPES } from '../../data/mockData.js';
import { formatDate, formatDateTime } from '../../utils/format.js';

const inputClass = 'w-full rounded border border-border-strong bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-600';

export default function Reports() {
  const [mines, setMines] = useState([]);
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [mineId, setMineId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    mineService.getMines().then(setMines);
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    setReport(null);
    try {
      const result = await reportsService.generateReport({ reportType, mineId, fromDate, toDate });
      setReport(result);
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-print-area, #report-print-area * { visibility: visible; }
          #report-print-area { position: absolute; top: 0; left: 0; width: 100%; }
        }
      `}</style>

      <PageHeader title="Reports" description="Generate governance reports across mines, time ranges, and categories." />

      <Card className="mb-6 max-w-2xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">Report Type</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className={inputClass}>
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">Mine</label>
            <select value={mineId} onChange={(e) => setMineId(e.target.value)} className={inputClass}>
              <option value="">All Mines</option>
              {mines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">From</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-500">To</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button icon={generating ? Loader2 : FileBarChart} onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {generating && (
        <Card>
          <div className="flex items-center gap-2 py-6 text-sm text-ink-500">
            <Loader2 size={16} className="animate-spin" /> Generating {reportType.toLowerCase()}…
          </div>
        </Card>
      )}

      {!generating && !report && (
        <Card>
          <EmptyState
            icon={FileBarChart}
            title="No report generated yet"
            description="Choose a report type and scope above, then click Generate Report."
          />
        </Card>
      )}

      {!generating && report && (
        <Card>
          <div id="report-print-area">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-base font-semibold text-ink-900">{report.reportType}</h3>
                <p className="text-sm text-ink-500">
                  Scope: {report.scope} · Generated {formatDateTime(report.generatedAt)}
                  {fromDate && ` · From ${formatDate(fromDate)}`}
                  {toDate && ` · To ${formatDate(toDate)}`}
                </p>
              </div>
              <Button variant="secondary" icon={Download} onClick={handleDownload} className="print:hidden">
                Download PDF
              </Button>
            </div>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {report.sections.map((s) => (
                <div key={s.label} className="flex items-center justify-between border-b border-border pb-2 text-sm">
                  <dt className="text-ink-700">{s.label}</dt>
                  <dd className="font-mono font-medium text-ink-900">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-ink-500">
              This is a prototype summary built from synthetic data. The production version will be generated and
              formatted by the backend reporting service.
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
