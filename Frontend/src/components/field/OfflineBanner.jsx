import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded border border-status-warning/30 bg-status-warningBg px-3.5 py-2.5 text-sm text-status-warning">
      <WifiOff size={15} className="shrink-0" />
      Offline — report will be saved and synced when connection is restored.
    </div>
  );
}
