/**
 * Axios 实例: 统一注入 JWT, 统一 401 处理。
 * 与后端 FastAPI 的 /api/* 契约对接; baseURL 为空表示同源 (生产 FastAPI 托管,
 * 开发经 next.config 的 rewrites 代理到后端)。
 */
import axios, { AxiosError } from 'axios'

const TOKEN_KEY = 'pal-token'

export const tokenStorage = {
  get: () => (typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export const api = axios.create({ baseURL: '' })

api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 -> 清 token 并跳登录 (交给页面守卫兜底; 这里只负责清理与广播)
api.interceptors.response.use(
  (r) => r,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      tokenStorage.clear()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** 从 axios 错误里提取后端 detail 文案, 回退到通用信息。 */
export function apiError(error: unknown, fallback = '操作失败'): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail
    if (detail) return detail
    if (error.message) return error.message
  }
  return fallback
}
