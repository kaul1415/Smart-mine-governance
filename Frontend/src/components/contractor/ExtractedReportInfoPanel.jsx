import { Bot } from 'lucide-react';

// Purely a display component. In mock mode the "extraction" is
// produced by contractorService (clearly commented as a stand-in);
// in real mode this renders whatever the backend/ML OCR service
// returns for the report. The frontend never runs OCR itself.
export default function ExtractedReportInfoPanel({ data }) {
  if (!data) return null;
  return (
    <div className="rounded border border-brand-100 bg-brand-100/40 p-3.5">
      <p className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-800">
        <Bot size={13} /> Extracted Information (from uploaded document)
      </p>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-ink-500">Contractor</dt>
          <dd className="font-medium text-ink-900">{data.contractor}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Project</dt>
          <dd className="text-ink-900">{data.project}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Report Date</dt>
          <dd className="text-ink-900">{data.reportDate}</dd>
        </div>
      </dl>
      <div className="mt-3 space-y-2.5">
        <div>
          <dt className="text-xs text-ink-500">Work / Progress</dt>
          <dd className="text-sm text-ink-900">{data.workProgress}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Safety Observations</dt>
          <dd className="text-sm text-ink-900">{data.safetyObservations}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Compliance Issues</dt>
          <dd className="text-sm text-ink-900">{data.complianceIssues}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-500">Corrective Actions</dt>
          <dd className="text-sm text-ink-900">{data.correctiveActions}</dd>
        </div>
      </div>
    </div>
  );
}
