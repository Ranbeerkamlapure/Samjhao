import api, { setToken, clearToken, getToken } from '../models/api';

export function updateAuthField(event, setForm) {
  const { name, value, type, checked } = event.target;
  setForm((prev) => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value,
  }));
}

function getAuthErrorMessage(error, fallback) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (!error.response) {
    return 'Cannot reach the server. Make sure the backend is running.';
  }

  return fallback;
}

export async function submitLogin(event, options) {
  event.preventDefault();

  const { form, setError, setLoading, setUser, navigate } = options;

  setError('');
  setLoading(true);

  try {
    const response = await api.post('/api/auth/login', {
      email: form.email.trim(),
      password: form.password,
    });

    setToken(response.data.token);
    setUser(response.data.user);
    navigate('/explain');
  } catch (error) {
    setError(getAuthErrorMessage(error, 'Login failed. Please try again.'));
  } finally {
    setLoading(false);
  }
}

export async function submitSignup(event, options) {
  event.preventDefault();

  const { form, setError, setLoading, setUser, navigate } = options;

  setError('');
  setLoading(true);

  try {
    const response = await api.post('/api/auth/signup', {
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    setToken(response.data.token);
    setUser(response.data.user);
    navigate('/explain');
  } catch (error) {
    setError(getAuthErrorMessage(error, 'Signup failed. Please try again.'));
  } finally {
    setLoading(false);
  }
}

// Used on app load to restore the session from localStorage
export async function loadCurrentUser() {
  if (!getToken()) {
    return null;
  }

  try {
    const response = await api.get('/api/auth/me');
    return response.data.user;
  } catch (_error) {
    clearToken();
    return null;
  }
}

export function logout(navigate, setUser) {
  clearToken();
  if (setUser) {
    setUser(null);
  }
  navigate('/login');
}
