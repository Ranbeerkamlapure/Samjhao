import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { updateAuthField, submitLogin } from '../controllers/authController';
import { useAuth } from '../App';
import BrandMark from './BrandMark';

function Login() {
  const navigate = useNavigate();
  const { user, setUser, authLoading } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return <div className="page auth-page">Checking login…</div>;
  }

  if (user) {
    return <Navigate to="/explain" replace />;
  }

  return (
    <div className="page auth-page">
      <form
        className="auth-card"
        onSubmit={(event) =>
          submitLogin(event, {
            form,
            setError,
            setLoading,
            setUser,
            navigate,
          })
        }
      >
        <Link to="/" className="brand brand-center">
          <BrandMark />
          Samjhao
        </Link>

        <h1>Log In to Samjhao</h1>
        <p className="auth-subtitle">
          Access your history and saved explanations
        </p>

        <label className="field">
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => updateAuthField(event, setForm)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </label>

        <label className="field">
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => updateAuthField(event, setForm)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={loading}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Logging in…' : 'Log In'}
        </button>

        <p className="auth-switch">
          Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
