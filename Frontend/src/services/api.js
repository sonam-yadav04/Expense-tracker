const BASE_URL = 'http://localhost:4000/api';

// ---- Generic request helper ----
const request = async (endpoint, options = {}, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
};

// ---- Auth ----
export const authAPI = {
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  getMe: (token) =>
    request('/auth/profile', {}, token),

  updateProfile: (payload, token) =>
    request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }, token),

  changePassword: (payload, token) =>
    request('/auth/password', { method: 'PUT', body: JSON.stringify(payload) }, token),
};

// ---- Expenses ----
export const expenseAPI = {
  getAll: (params = {}, token) => {
    console.log("TOKEN:", token);
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/expenses${qs ? `?${qs}` : ''}`, {}, token);
  },

  getById: (id, token) =>
    request(`/expenses/${id}`, {}, token),

  create: (payload, token) =>
    request('/expenses', { method: 'POST', body: JSON.stringify(payload) }, token),

  update: (id, payload, token) =>
    request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }, token),

  delete: (id, token) =>
    request(`/expenses/${id}`, { method: 'DELETE' }, token),

  getSummary: (params = {}, token) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    ).toString();
    return request(`/expenses/summary${qs ? `?${qs}` : ''}`, {}, token);
  },

  getMonthly: (token) =>
    request('/expenses/monthly', {}, token),
};

export default { authAPI, expenseAPI };