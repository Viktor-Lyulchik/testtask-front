import axios, { AxiosError } from 'axios'
import { store } from '../store/store'
import { setAccessToken, logout } from '../store/authSlice'

const api = axios.create({ baseURL: '/api' })

// ─── Request interceptor — attach access token ────────────────────────────
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Response interceptor — silent token refresh on 401 ──────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token!),
  )
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    // Only handle 401 on non-auth endpoints and only once per request
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/')
    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = store.getState().auth.refreshToken
    if (!refreshToken) {
      store.dispatch(logout())
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the refresh is done
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((newToken) => {
        originalRequest!.headers!.Authorization = `Bearer ${newToken}`
        return api(originalRequest!)
      })
    }

    originalRequest!._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post('/api/auth/refresh', { refreshToken })
      // Update both tokens in Redux + localStorage
      store.dispatch(setAccessToken(data.accessToken))
      // Also update refreshToken in store for next rotation
      store.dispatch({
        type: 'auth/setAuth',
        payload: {
          user: store.getState().auth.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      })

      processQueue(null, data.accessToken)
      originalRequest!.headers!.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest!)
    } catch (refreshError) {
      processQueue(refreshError, null)
      store.dispatch(logout())
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
