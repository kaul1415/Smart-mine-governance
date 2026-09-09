import { getQueueItems, updateQueueItem, removeQueueItem } from '../utils/offlineStore.js';
import { flagService } from './flagService.js';

// Each queue item's `payload` is already shaped for the service call
// its `type` maps to. Attendance and observation items are mocked
// with a short delay here since this frontend doesn't own a generic
// field-attendance/observation endpoint yet — flags sync through the
// real flagService the same way an online submission would.
async function syncItem(item) {
  await updateQueueItem(item.localId, { syncStatus: 'Syncing' });
  try {
    if (item.type === 'flag') {
      await flagService.createFlag(item.payload);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    await removeQueueItem(item.localId);
    return { localId: item.localId, status: 'Synced' };
  } catch (err) {
    const retryCount = (item.retryCount || 0) + 1;
    await updateQueueItem(item.localId, { syncStatus: 'Failed', retryCount });
    return { localId: item.localId, status: 'Failed', error: err.message };
  }
}

async function syncPendingItems() {
  const items = await getQueueItems();
  const pending = items.filter((i) => i.syncStatus === 'Pending' || i.syncStatus === 'Failed');
  const results = [];
  for (const item of pending) {
    results.push(await syncItem(item));
  }
  return results;
}

async function retryItem(localId) {
  const items = await getQueueItems();
  const item = items.find((i) => i.localId === localId);
  if (!item) return null;
  return syncItem(item);
}

export const syncService = { syncPendingItems, retryItem };
