<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <h2 class="title">🎮 幻兽帕鲁 · 管理面板</h2>
      <el-form @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" :prefix-icon="Lock"
                    show-password @keyup.enter="onLogin" />
        </el-form-item>
        <el-button type="primary" :loading="loading" class="btn" @click="onLogin">登录</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import api from '../api'

const router = useRouter()
const username = ref('admin')
const password = ref('')
const loading = ref(false)

async function onLogin() {
  loading.value = true
  try {
    const form = new URLSearchParams()
    form.append('username', username.value)
    form.append('password', password.value)
    const { data } = await api.post('/api/auth/login', form)
    localStorage.setItem('token', data.access_token)
    router.push({ name: 'dashboard' })
  } catch (e) {
    ElMessage.error(e.response?.data?.detail || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap { height: 100%; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.login-card { width: 360px; padding: 12px; }
.title { text-align: center; margin: 8px 0 24px; color: #303133; }
.btn { width: 100%; }
</style>
