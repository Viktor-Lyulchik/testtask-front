import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface User {
  id: number
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null       // accessToken (15m)
  refreshToken: string | null // refreshToken (30d)
}

const stored = localStorage.getItem('auth')
const initial: AuthState = stored
  ? JSON.parse(stored)
  : { user: null, token: null, refreshToken: null }

const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setAuth(
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user
      state.token = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
        }),
      )
    },
    // Called by the axios interceptor after a silent token refresh
    setAccessToken(state, action: PayloadAction<string>) {
      state.token = action.payload
      // Persist updated access token
      const stored = localStorage.getItem('auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        parsed.token = action.payload
        localStorage.setItem('auth', JSON.stringify(parsed))
      }
    },
    logout(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      localStorage.removeItem('auth')
    },
  },
})

export const { setAuth, setAccessToken, logout } = authSlice.actions
export default authSlice.reducer
