/** 认证服务: 登录 (OAuth2 password form) + 当前用户。 */
import { api } from '@/lib/api'
import type { TokenResponse } from '@/types/api'

export async function login(username: string, password: string): Promise<TokenResponse> {
  // 后端为 OAuth2PasswordRequestForm, 需 x-www-form-urlencoded
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const { data } = await api.post<TokenResponse>('/api/auth/login', form)
  return data
}

export async function fetchMe(): Promise<{ username: string }> {
  const { data } = await api.get<{ username: string }>('/api/auth/me')
  return data
}
