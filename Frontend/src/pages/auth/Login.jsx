import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES, ROLE_LABELS } from '../../utils/roles.js';
import { DEPARTMENTS, DEPARTMENT_LABELS } from '../../utils/departments.js';

const ROLE_OPTIONS = Object.values(ROLES);
const DEPARTMENT_OPTIONS = Object.values(DEPARTMENTS);

export default function Login() {
  const { login, isAuthenticating, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.CORPORATE_ADMIN);
  const [department, setDepartment] = useState(DEPARTMENTS.SYSTEM);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const user = await login({ email: email || `${role}@minegov.ai`, password, role, department });
      const defaultPath = user.role === ROLES.CONTRACTOR ? '/contractor/dashboard' : '/dashboard';
      const redirectTo = location.state?.from?.pathname || defaultPath;
      navigate(redirectTo, { replace: true });
    } catch {
      // authError is already surfaced from context
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            placeholder="you@minegov.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600"
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
            className="w-full rounded border border-border-strong px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium text-ink-700">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded border border-border-strong bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-600"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="department" className="mb-1 block text-sm font-medium text-ink-700">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded border border-border-strong bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-600"
            >
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {DEPARTMENT_LABELS[d]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {authError && <p className="text-sm text-status-danger">{authError}</p>}

        <Button type="submit" icon={LogIn} className="w-full" disabled={isAuthenticating}>
          {isAuthenticating ? 'Signing in…' : 'Sign in'}
        </Button>

        <p className="text-center text-xs text-ink-500">
          Mock authentication for prototype purposes. Any email/password is accepted. Role shapes which screens you
          see; System Department carries admin-level access regardless of role.
        </p>
      </form>
    </Card>
  );
}
