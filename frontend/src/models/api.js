import axios from 'axios';

const TOKEN_KEY = 'samjhao_token';
export const AUTH_EXPIRED_EVENT = 'samjhao:auth-expired';

// Shared Axios client for backend API calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 300000, // Gemini can take several minutes on large/complex images
});

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Attach JWT to every request when available
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Clear bad/expired tokens and notify the app so AuthContext logs the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
