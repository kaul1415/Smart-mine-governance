import { useState } from 'react';
import { LogOut, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader.jsx';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { roleLabel, hasAdminAccess } from '../../utils/roles.js';
import { departmentLabel } from '../../utils/departments.js';

function initials(name = '') {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [prefs, setPrefs] = useState({
    emailAlerts: true,
    highRiskAlerts: true,
    complianceReminders: true,
  });

  function togglePref(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <>
      <PageHeader title="Settings" description="Account details and notification preferences." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-900">Account</h3>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-800">
              {initials(user?.name)}
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">{user?.name}</p>
              <p className="text-xs text-ink-500">{user?.email}</p>
            </div>
          </div>
          <dl className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-ink-500">Role</dt>
              <dd className="font-medium text-ink-900">{roleLabel(user?.role)}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-ink-500">Department</dt>
              <dd className="font-medium text-ink-900">{departmentLabel(user?.department)}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-ink-500">Access Level</dt>
              <dd>
                {hasAdminAccess(user) ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-status-successBg px-2 py-0.5 text-xs font-medium text-status-success">
                    <ShieldCheck size={12} /> Admin-level access
                  </span>
                ) : (
                  <span className="text-ink-700">Standard</span>
                )}
              </dd>
            </div>
          </dl>
          <p className="mt-4 border-t border-border pt-4 text-xs text-ink-500">
            Role and department are set by your organization. Admin-level access is granted to the Corporate Admin
            role or to any member of the System Department, regardless of role — this mirrors how the production
            backend will enforce department-based authorization.
          </p>
          <div className="mt-4">
            <Button variant="secondary" icon={LogOut} onClick={logout}>
              Log out
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-sm font-semibold text-ink-900">Notification Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between gap-3 text-sm text-ink-700">
              <span>Email alerts for new flags</span>
              <input type="checkbox" checked={prefs.emailAlerts} onChange={() => togglePref('emailAlerts')} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-ink-700">
              <span>High-risk mine alerts</span>
              <input type="checkbox" checked={prefs.highRiskAlerts} onChange={() => togglePref('highRiskAlerts')} />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm text-ink-700">
              <span>Compliance due-date reminders</span>
              <input type="checkbox" checked={prefs.complianceReminders} onChange={() => togglePref('complianceReminders')} />
            </label>
          </div>
          <p className="mt-4 border-t border-border pt-4 text-xs text-ink-500">
            Preferences are stored locally in this prototype. The backend will own delivery (email/SMS/push) once
            connected.
          </p>
        </Card>
      </div>
    </>
  );
}
