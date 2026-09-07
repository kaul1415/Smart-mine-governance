import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { roleLabel } from '../../utils/roles.js';
import { departmentLabel } from '../../utils/departments.js';
import { notificationService } from '../../services/notificationService.js';

function initials(name = '') {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationService.getUnreadCount().then(setUnreadCount);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface-card px-4 sm:px-6">
      <button
        className="rounded p-2 text-ink-700 hover:bg-surface-sunken lg:hidden"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <Link
        to="/notifications"
        className="relative rounded p-2 text-ink-700 hover:bg-surface-sunken"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-sunken"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">
            {initials(user?.name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-tight text-ink-900">{user?.name}</span>
            <span className="block text-xs leading-tight text-ink-500">
              {roleLabel(user?.role)}
              {user?.department && ` · ${departmentLabel(user.department)}`}
            </span>
          </span>
          <ChevronDown size={16} className="hidden text-ink-500 sm:block" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md border border-border bg-surface-card py-1 shadow-popover">
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-surface-sunken"
              >
                <Settings size={15} />
                Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-status-danger hover:bg-surface-sunken"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
