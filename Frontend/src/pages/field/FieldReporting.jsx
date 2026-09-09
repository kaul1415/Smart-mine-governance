import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Radio } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import OfflineBanner from '../../components/field/OfflineBanner.jsx';
import SyncQueuePanel from '../../components/field/SyncQueuePanel.jsx';
import FieldFlagForm from '../../components/field/FieldFlagForm.jsx';
import FieldObservationForm from '../../components/field/FieldObservationForm.jsx';
import FieldAttendanceForm from '../../components/field/FieldAttendanceForm.jsx';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js';
import { mineService } from '../../services/mineService.js';
import { syncService } from '../../services/syncService.js';
import { addQueueItem, getQueueItems, newLocalId } from '../../utils/offlineStore.js';

const TABS = [
  { key: 'flag', label: 'Report a Flag' },
  { key: 'observation', label: 'Safety Observation' },
  { key: 'attendance', label: 'Attendance' },
];

export default function FieldReporting() {
  const isOnline = useOnlineStatus();
  const [tab, setTab] = useState('flag');
  const [mines, setMines] = useState([]);
  const [queue, setQueue] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [saveConfirmation, setSaveConfirmation] = useState(null);
  const [queueError, setQueueError] = useState(null);

  const refreshQueue = useCallback(async () => {
    try {
      const items = await getQueueItems();
      setQueue(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setQueueError(null);
    } catch (err) {
      setQueueError(err.message || 'Offline storage is unavailable in this browser.');
    }
  }, []);

  useEffect(() => {
    mineService.getMines().then(setMines);
    refreshQueue();
  }, [refreshQueue]);

  const runSync = useCallback(async () => {
    setSyncing(true);
    try {
      const results = await syncService.syncPendingItems();
      const succeeded = results.filter((r) => r.status === 'Synced').length;
      if (succeeded > 0) {
        setSyncMessage(`${succeeded} report${succeeded === 1 ? '' : 's'} synced successfully.`);
        setTimeout(() => setSyncMessage(null), 4000);
      }
      await refreshQueue();
    } finally {
      setSyncing(false);
    }
  }, [refreshQueue]);

  // Auto-sync whenever connectivity returns and there's something queued.
  useEffect(() => {
    if (isOnline && queue.some((i) => i.syncStatus === 'Pending' || i.syncStatus === 'Failed')) {
      runSync();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  async function enqueue(type, payload) {
    const item = {
      localId: newLocalId(),
      type,
      payload,
      createdAt: new Date().toISOString(),
      syncStatus: 'Pending',
      retryCount: 0,
    };
    await addQueueItem(item);
    await refreshQueue();
    setSaveConfirmation(isOnline ? 'Saved. Syncing now…' : 'Saved offline. Will sync when connection is restored.');
    setTimeout(() => setSaveConfirmation(null), 3500);
    if (isOnline) runSync();
  }

  async function handleRetry(localId) {
    await syncService.retryItem(localId);
    await refreshQueue();
  }

  return (
    <>
      <PageHeader
        title="Field Reporting"
        description="Mobile-friendly, offline-first capture for flags, safety observations, and attendance."
      />

      {!isOnline && <OfflineBanner />}
      {saveConfirmation && (
        <div className="mb-4 flex items-center gap-2 rounded border border-status-successBg bg-status-successBg px-3.5 py-2.5 text-sm text-status-success">
          <CheckCircle2 size={15} className="shrink-0" /> {saveConfirmation}
        </div>
      )}
      {syncMessage && (
        <div className="mb-4 flex items-center gap-2 rounded border border-status-successBg bg-status-successBg px-3.5 py-2.5 text-sm text-status-success">
          <Radio size={15} className="shrink-0" /> {syncMessage}
        </div>
      )}
      {queueError && <div className="mb-4 text-sm text-status-danger">{queueError}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padded={false}>
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
            <div className="p-4">
              {tab === 'flag' && <FieldFlagForm mines={mines} onSubmit={(payload) => enqueue('flag', payload)} />}
              {tab === 'observation' && <FieldObservationForm mines={mines} onSubmit={(payload) => enqueue('observation', payload)} />}
              {tab === 'attendance' && <FieldAttendanceForm mines={mines} onSubmit={(payload) => enqueue('attendance', payload)} />}
            </div>
          </Card>
        </div>

        <SyncQueuePanel items={queue} isOnline={isOnline} syncing={syncing} onSyncAll={runSync} onRetry={handleRetry} />
      </div>
    </>
  );
}
