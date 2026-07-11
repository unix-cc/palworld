import axios from 'axios'
import router from './router'

const api = axios.create({ baseURL: '/' })

// 请求携带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 -> 跳登录
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      if (router.currentRoute.value.name !== 'login') router.push({ name: 'login' })
    }
    return Promise.reject(err)
  }
)

export default api
