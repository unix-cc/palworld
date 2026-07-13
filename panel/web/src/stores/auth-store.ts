/**
 * 认证状态 (Zustand)。
 * - token 持久化到 localStorage (与 lib/api 的 tokenStorage 同键)。
 * - 仅存 token 与登录态; 用户信息按需从 /api/auth/me 拉取。
 */
import { create } from 'zustand'
import { tokenStorage } from '@/lib/api'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  hydrate: () => void
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  hydrate: () => {
    const token = tokenStorage.get()
    set({ token, isAuthenticated: !!token })
  },
  login: (token) => {
    tokenStorage.set(token)
    set({ token, isAuthenticated: true })
  },
  logout: () => {
    tokenStorage.clear()
    set({ token: null, isAuthenticated: false })
  },
}))
