import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card.jsx';

export default function FlagsByCategoryChart({ data }) {
  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold text-ink-900">Flags by Category</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8, top: 4, bottom: 0 }}>
            <CartesianGrid stroke="#DCE1E8" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#5B6B7C' }} axisLine={{ stroke: '#DCE1E8' }} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 12, fill: '#5B6B7C' }} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: '#DCE1E8' }} />
            <Bar dataKey="count" fill="#1B4965" radius={[3, 3, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
