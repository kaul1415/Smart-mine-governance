import Card from './Card.jsx';
import LoadingState from './LoadingState.jsx';
import EmptyState from './EmptyState.jsx';
import ErrorState from './ErrorState.jsx';

/**
 * columns: [{ key, header, render?(row), className? }]
 * data: array of rows
 * rowKey: (row) => string
 * onRowClick: (row) => void
 */
export default function DataTable({
  columns,
  data,
  rowKey,
  onRowClick,
  status = 'success',
  error,
  onRetry,
  emptyTitle = 'No records found.',
  emptyDescription,
  footer,
}) {
  if (status === 'loading') {
    return (
      <Card padded={false}>
        <LoadingState />
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card padded={false}>
        <ErrorState message={error} onRetry={onRetry} />
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card padded={false}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Card>
    );
  }

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="table-scroll">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-sunken">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-surface-sunken' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 align-middle text-ink-700 ${col.className || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </Card>
  );
}
