import axios from 'axios'
import { supabase } from './supabase'
import { useAuthStore } from '@/store/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach auth token if available in Supabase session
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    } catch {
      // Ignore in offline mode
    }
  }
  return config
})

// Clear stale auth state if backend rejects the token with 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const { isAuthenticated, logout } = useAuthStore.getState()
      if (isAuthenticated) {
        await logout()
      }
    }
    return Promise.reject(error)
  }
)

export default api
