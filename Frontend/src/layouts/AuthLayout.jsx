import { ShieldCheck } from 'lucide-react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-brand-800 text-white">
            <ShieldCheck size={22} />
          </span>
          <p className="text-lg font-semibold text-ink-900">MineGov AI</p>
          <p className="text-sm text-ink-500">Smart Governance & Compliance Monitoring</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
