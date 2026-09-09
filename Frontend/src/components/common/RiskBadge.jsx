const RISK_CLASSES = {
  LOW: 'bg-risk-lowBg text-risk-low',
  MEDIUM: 'bg-risk-mediumBg text-risk-medium',
  HIGH: 'bg-risk-highBg text-risk-high',
  CRITICAL: 'bg-risk-criticalBg text-risk-critical',
};

export default function RiskBadge({ level, score }) {
  const classes = RISK_CLASSES[level] || RISK_CLASSES.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-semibold ${classes}`}>
      {level}
      {typeof score === 'number' && <span className="font-mono font-normal opacity-80">{score}/100</span>}
    </span>
  );
}
