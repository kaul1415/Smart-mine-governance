import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

export default function ComplianceTrendChart({ data }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-ink-900">Compliance Trend</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="#DCE1E8" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#5B6B7C' }} axisLine={{ stroke: '#DCE1E8' }} tickLine={false} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#5B6B7C' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Compliance rate']}
              contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE1E8' }}
            />
            <Line type="monotone" dataKey="rate" stroke="#0B2545" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
