import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, X, LogOut } from 'lucide-react';
import { navForRole } from '../../utils/navigation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { roleLabel } from '../../utils/roles.js';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sections = navForRole(user?.role);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <>
      {/* Mobile scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-brand-900 text-white transition-transform lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-brand-100 text-brand-900">
              <ShieldCheck size={18} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">MineGov AI</p>
              <p className="text-[11px] text-white/50">Governance & Compliance</p>
            </div>
          </div>
          <button className="text-white/60 hover:text-white lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-4">
              {section.title && (
                <p className="px-3 pb-1.5 pt-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 rounded px-3 py-2 text-sm font-medium transition-colors ${
                          isActive ? 'bg-brand-700 text-white' : 'text-white/70 hover:bg-brand-800 hover:text-white'
                        }`
                      }
                    >
                      <item.icon size={16} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded px-3 py-2 text-sm font-medium text-white/70 hover:bg-brand-800 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
          <p className="px-3 pt-2 text-[11px] text-white/40">
            {user ? roleLabel(user.role) : ''} · SIH Prototype
          </p>
        </div>
      </aside>
    </>
  );
}
