import SearchInput from './SearchInput.jsx';

/**
 * search: { value, onChange, placeholder } | undefined
 * selects: [{ key, label, value, onChange, options: [{value, label}] }]
 * dateFilter: { value, onChange, label } | undefined — renders a native date input
 */
export default function FilterBar({ search, selects = [], dateFilter }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      {search && (
        <SearchInput
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder}
          className="sm:w-64"
        />
      )}
      {dateFilter && (
        <label className="flex items-center gap-1.5 text-xs text-ink-500">
          {dateFilter.label || 'From'}
          <input
            type="date"
            value={dateFilter.value}
            onChange={(e) => dateFilter.onChange(e.target.value)}
            className="rounded border border-border-strong bg-white px-2 py-1.5 text-sm text-ink-700 focus:border-brand-600"
          />
        </label>
      )}
      {selects.map((s) => (
        <select
          key={s.key}
          value={s.value}
          onChange={(e) => s.onChange(e.target.value)}
          className="rounded border border-border-strong bg-white px-2.5 py-1.5 text-sm text-ink-700 focus:border-brand-600 sm:w-auto"
        >
          <option value="">{s.label}</option>
          {s.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
