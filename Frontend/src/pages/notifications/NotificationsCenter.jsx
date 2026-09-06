import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import NotificationItem from '../../components/notifications/NotificationItem.jsx';
import { notificationService } from '../../services/notificationService.js';

const CATEGORIES = ['HIGH RISK', 'OVERDUE', 'COMPLIANCE', 'FLAG', 'AI ALERT'];

export default function NotificationsCenter() {
  const [state, setState] = useState({ status: 'loading', items: [], error: null });
  const [category, setCategory] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  async function load() {
    setState({ status: 'loading', items: [], error: null });
    try {
      const items = await notificationService.getNotifications();
      setState({ status: 'success', items, error: null });
    } catch (err) {
      setState({ status: 'error', items: [], error: err.message || 'Unable to load notifications.' });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleMarkRead(id) {
    await notificationService.markAsRead(id);
    await load();
  }

  async function handleMarkAllRead() {
    await notificationService.markAllAsRead();
    await load();
  }

  const filtered = state.items.filter((n) => {
    if (category && n.type !== category) return false;
    if (unreadOnly && n.read) return false;
    return true;
  });

  const unreadCount = state.items.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description="System and AI-generated alerts across governance, risk, and compliance."
        actions={
          unreadCount > 0 && (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )
        }
      />

      <FilterBar
        selects={[
          { key: 'category', label: 'All Categories', value: category, onChange: setCategory, options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        ]}
      />
      <label className="mb-4 -mt-2 flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
        Show unread only
      </label>

      <Card padded={false}>
        {state.status === 'loading' && <LoadingState label="Loading notifications…" />}
        {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
        {state.status === 'success' && filtered.length === 0 && (
          <EmptyState title="No notifications" description="You're all caught up." />
        )}
        {state.status === 'success' && filtered.length > 0 && (
          <ul className="divide-y divide-border">
            {filtered.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
