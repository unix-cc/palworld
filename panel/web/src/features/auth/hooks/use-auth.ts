/** 认证钩子: 登录 mutation。 */
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth-store'
import { login as loginRequest } from '../services/auth-service'

export function useLogin() {
  const router = useRouter()
  const setToken = useAuthStore((s) => s.login)
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      loginRequest(username, password),
    onSuccess: (data) => {
      setToken(data.access_token)
      router.replace('/dashboard')
    },
    onError: (err) => toast.error(apiError(err, '登录失败')),
  })
}
