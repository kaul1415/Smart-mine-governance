import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../utils/roles.js';
import { DEPARTMENTS, DEPARTMENT_ORDER, DEPARTMENT_LABELS } from '../../utils/departments.js';

const LOGIN_TABS = [
  { key: 'department', label: 'Department' },
  { key: 'contractor', label: 'Contractor' },
  { key: 'regulator', label: 'Regulator' },
];

const inputClass =
  'w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600';

export default function Login() {
  const { login, isAuthenticating, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginType, setLoginType] = useState('department');
  const [department, setDepartment] = useState(DEPARTMENTS.SYSTEM);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await login({
        username,
        password,
        loginType,
        department: loginType === 'department' ? department : undefined,
      });
      const defaultPath = user.role === ROLES.CONTRACTOR ? '/contractor/dashboard' : '/dashboard';
      const redirectTo = location.state?.from?.pathname || defaultPath;
      navigate(redirectTo, { replace: true });
    } catch {
      // authError is already surfaced from context
    }
  }

  return (
    <Card>
      <div className="mb-4 flex rounded border border-border-strong p-0.5 text-sm">
        {LOGIN_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setLoginType(tab.key)}
            className={`flex-1 rounded px-2 py-1.5 font-medium transition-colors ${
              loginType === tab.key ? 'bg-brand-800 text-white' : 'text-ink-700 hover:bg-surface-sunken'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {loginType === 'department' && (
          <div>
            <label htmlFor="department" className="mb-1 block text-sm font-medium text-ink-700">
              Select Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded border border-border-strong bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-600"
            >
              {DEPARTMENT_ORDER.map((d) => (
                <option key={d} value={d}>
                  {DEPARTMENT_LABELS[d]}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-500">
              One shared login for every department — System Department carries organization-wide, admin-level
              access.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium text-ink-700">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="e.g. officer1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </div>

        {authError && <p className="text-sm text-status-danger">{authError}</p>}

        <Button type="submit" icon={LogIn} className="w-full" disabled={isAuthenticating}>
          {isAuthenticating ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-xs text-ink-500">
          Mock authentication for prototype purposes — any username/password is accepted.
        </p>
      </form>
    </Card>
  );
}
