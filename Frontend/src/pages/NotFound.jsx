import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-surface-canvas px-4 text-center">
      <p className="text-5xl font-semibold text-ink-900">404</p>
      <p className="text-sm text-ink-500">This page doesn't exist.</p>
      <Link to="/dashboard">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
