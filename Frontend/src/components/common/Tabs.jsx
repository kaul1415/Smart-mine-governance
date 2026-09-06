export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="border-b border-border">
      <nav className="table-scroll -mb-px flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`shrink-0 border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active === tab.key
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-ink-500 hover:text-ink-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
