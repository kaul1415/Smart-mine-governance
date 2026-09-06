import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckSquare, Camera, MapPin } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import RiskBadge from '../../components/common/RiskBadge.jsx';
import ObservationForm from '../../components/inspections/ObservationForm.jsx';
import AIAnalysisPanel from '../../components/inspections/AIAnalysisPanel.jsx';
import { inspectionService } from '../../services/inspectionService.js';
import { formatDateTime } from '../../utils/format.js';

export default function InspectionDetails() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', inspection: null, error: null });
  const [lastAnalysis, setLastAnalysis] = useState(null);

  const load = useCallback(async () => {
    setState({ status: 'loading', inspection: null, error: null });
    try {
      const inspection = await inspectionService.getInspectionById(id);
      setState({ status: 'success', inspection, error: null });
    } catch (err) {
      setState({ status: 'error', inspection: null, error: err.message || 'Unable to load this inspection.' });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleObservationSubmit(observation) {
    const saved = await inspectionService.submitObservation(id, observation);
    setLastAnalysis(saved.aiAnalysis);
    await load();
  }

  if (state.status === 'loading') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Inspections', path: '/inspections' }, { label: id }]} />
        <LoadingState label="Loading inspection…" />
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <>
        <PageHeader title={id} breadcrumbs={[{ label: 'Inspections', path: '/inspections' }, { label: id }]} />
        <ErrorState message={state.error} onRetry={load} />
      </>
    );
  }

  const { inspection } = state;

  if (!inspection) {
    return (
      <>
        <PageHeader title="Inspection not found" breadcrumbs={[{ label: 'Inspections', path: '/inspections' }]} />
        <Card>
          <EmptyState title="This inspection doesn't exist" description={`No inspection found with ID ${id}.`} />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={inspection.id}
        description={`${inspection.inspectionType} · ${inspection.mineName}`}
        breadcrumbs={[{ label: 'Inspections', path: '/inspections' }, { label: inspection.id }]}
        actions={<StatusBadge status={inspection.status} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Mine</dt>
                <dd className="text-sm text-ink-900">
                  <Link to={`/mines/${inspection.mineId}`} className="text-brand-700 hover:underline">
                    {inspection.mineName}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Inspector</dt>
                <dd className="text-sm text-ink-900">{inspection.inspector}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Date</dt>
                <dd className="text-sm text-ink-900">{formatDateTime(inspection.date)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Overall Risk</dt>
                <dd className="text-sm text-ink-900">{inspection.riskLevel ? <RiskBadge level={inspection.riskLevel} /> : '—'}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink-900">
              <CheckSquare size={15} /> Checklist
            </h3>
            {inspection.checklist?.length > 0 ? (
              <ul className="space-y-1.5">
                {inspection.checklist.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-ink-700">
                    <CheckSquare size={14} className="text-ink-500" /> {item}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No checklist defined" />
            )}
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-ink-900">Observations</h3>
            {inspection.observations.length === 0 ? (
              <EmptyState title="No observations recorded yet" description="Add the first field observation below." />
            ) : (
              <ul className="mb-4 space-y-3">
                {inspection.observations.map((obs) => (
                  <li key={obs.id} className="rounded border border-border p-3.5">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink-900">{obs.category}</span>
                      <RiskBadge level={obs.severity} />
                    </div>
                    <p className="text-sm text-ink-700">{obs.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                      {obs.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {obs.location}
                        </span>
                      )}
                      {obs.photoCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Camera size={11} /> {obs.photoCount} photo(s)
                        </span>
                      )}
                      <span>{formatDateTime(obs.timestamp)}</span>
                    </div>
                    {obs.comments && <p className="mt-1.5 text-xs italic text-ink-500">"{obs.comments}"</p>}
                    {obs.aiAnalysis && (
                      <div className="mt-3">
                        <AIAnalysisPanel analysis={obs.aiAnalysis} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <ObservationForm onSubmit={handleObservationSubmit} />
          </Card>
        </div>

        <div className="space-y-4">
          {lastAnalysis && (
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-ink-900">Latest AI Analysis</h3>
              <AIAnalysisPanel analysis={lastAnalysis} />
              <p className="mt-2 text-xs text-ink-500">
                This is only a UI representation — the classification is returned by the backend/AI service, never
                computed in the browser.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
