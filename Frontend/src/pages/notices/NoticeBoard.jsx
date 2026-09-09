import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader.jsx';
import FilterBar from '../../components/common/FilterBar.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import ErrorState from '../../components/common/ErrorState.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import NoticeCard from '../../components/notices/NoticeCard.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { noticeService } from '../../services/noticeService.js';
import { NOTICE_CATEGORIES } from '../../data/mockData.js';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [state, setState] = useState({ status: 'loading', notices: [], error: null });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  async function load() {
    setState({ status: 'loading', notices: [], error: null });
    try {
      const notices = await noticeService.getNotices(user?.department);
      setState({ status: 'success', notices, error: null });
    } catch (err) {
      setState({ status: 'error', notices: [], error: err.message || 'Unable to load the notice board.' });
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.department]);

  const filtered = state.notices.filter((n) => {
    if (category && n.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Notice Board"
        description="One organization-wide board, visible to every department — not a separate board per department."
      />

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search notices…' }}
        selects={[{ key: 'category', label: 'All Categories', value: category, onChange: setCategory, options: NOTICE_CATEGORIES.map((c) => ({ value: c, label: c })) }]}
      />

      {state.status === 'loading' && <LoadingState label="Loading notices…" />}
      {state.status === 'error' && <ErrorState message={state.error} onRetry={load} />}
      {state.status === 'success' && filtered.length === 0 && <EmptyState title="No notices found" />}
      {state.status === 'success' && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filtered.map((n) => (
            <NoticeCard key={n.id} notice={n} />
          ))}
        </div>
      )}
    </>
  );
}
