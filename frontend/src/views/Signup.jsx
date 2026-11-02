import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { updateAuthField, submitSignup } from '../controllers/authController';
import { useAuth } from '../App';
import BrandMark from './BrandMark';

function Signup() {
  const navigate = useNavigate();
  const { user, setUser, authLoading } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
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
          submitSignup(event, {
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

        <h1>Create Your Account</h1>
        <p className="auth-subtitle">
          Get started with Samjhao in just a few steps
        </p>

        <label className="field">
          Full Name
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={(event) => updateAuthField(event, setForm)}
            placeholder="Your full name"
            autoComplete="name"
            required
            disabled={loading}
          />
        </label>

        <label className="field">
          Email Address
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
            placeholder="Create a password"
            autoComplete="new-password"
            required
            minLength={6}
            disabled={loading}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={loading}
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
