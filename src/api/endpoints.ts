import axios from 'axios'
import api from './api'

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }).then((r) => r.data),

  // Logout: tell backend to invalidate the refresh token
  // Uses plain axios (not intercepted api) to avoid refresh loop on 401
  logout: (refreshToken: string) =>
    axios.post('/api/auth/logout', { refreshToken }).catch(() => {
      // Ignore errors — we clear local state regardless
    }),

  // Logout from all devices (requires valid access token)
  logoutAll: () => api.post('/auth/logout-all'),
}

export const propertiesApi = {
  getAll: () => api.get('/properties').then((r) => r.data),
}

export const applicationsApi = {
  create: (propertyId: number, amount: number) =>
    api.post('/applications', { propertyId, amount }).then((r) => r.data),
  getMine: () => api.get('/applications').then((r) => r.data),
  remove: (id: number) => api.delete(`/applications/${id}`),
}
