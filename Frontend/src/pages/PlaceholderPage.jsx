import { Construction } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';

export default function PlaceholderPage({ title, phase }) {
  return (
    <>
      <PageHeader title={title} />
      <Card>
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Construction size={26} className="text-ink-500" />
          <p className="text-sm font-medium text-ink-700">{title} is coming in {phase}</p>
          <p className="max-w-sm text-sm text-ink-500">
            This module is scoped for a later build phase and isn't implemented yet. The route, layout and
            navigation are already wired up.
          </p>
        </div>
      </Card>
    </>
  );
}
