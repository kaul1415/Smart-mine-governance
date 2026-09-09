import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

const LINE_COLORS = ['#B3401D', '#B7791F', '#1B4965', '#2F6846', '#5B6B7C'];

export default function RiskTrendChart({ riskScores }) {
  const months = riskScores[0]?.history?.map((h) => h.month) || [];
  const data = months.map((month, i) => {
    const point = { month };
    riskScores.forEach((r) => {
      point[r.mineName] = r.history[i]?.score;
    });
    return point;
  });

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-ink-900">Risk Trend by Mine</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="#DCE1E8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5B6B7C' }} axisLine={{ stroke: '#DCE1E8' }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#5B6B7C' }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE1E8' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {riskScores.map((r, i) => (
              <Line
                key={r.mineId}
                type="monotone"
                dataKey={r.mineName}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
