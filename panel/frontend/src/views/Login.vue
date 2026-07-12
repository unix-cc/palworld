<template>
  <div class="login-wrap">
    <!-- 背景装饰: 低对比网格 + 光晕, 纯 CSS, 不抢焦点 -->
    <div class="bg-grid" aria-hidden="true"></div>
    <div class="bg-glow" aria-hidden="true"></div>

    <div class="login-card">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <el-icon :size="26"><Monitor /></el-icon>
        </div>
        <div class="brand-text">
          <h1 class="brand-title">幻兽帕鲁</h1>
          <p class="brand-sub">服务器管理面板</p>
        </div>
      </div>

      <el-form class="form" @submit.prevent="onLogin">
        <el-form-item>
          <el-input v-model="username" placeholder="用户名" size="large"
                    :prefix-icon="User" autocomplete="username" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="password" type="password" placeholder="密码" size="large"
                    :prefix-icon="Lock" show-password autocomplete="current-password"
                    @keyup.enter="onLogin" />
        </el-form-item>
        <el-button type="primary" size="large" :loading="loading" class="btn" @click="onLogin">
          {{ loading ? '登录中…' : '登 录' }}
        </el-button>
      </el-form>

      <p class="foot">Palworld Dedicated Server · Web Console</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
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
.login-wrap {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--pal-bg);
  overflow: hidden;
}

/* 低对比网格背景 (数据仪表盘观感, 不干扰阅读) */
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(var(--pal-border-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--pal-border-soft) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: .35;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, #000 40%, transparent 100%);
}
/* 强调绿光晕 */
.bg-glow {
  position: absolute; top: 18%; left: 50%;
  width: 520px; height: 520px; transform: translateX(-50%);
  background: radial-gradient(circle, var(--pal-accent-soft) 0%, transparent 70%);
  pointer-events: none;
}

.login-card {
  position: relative;
  width: 380px;
  max-width: calc(100vw - 32px);
  padding: 32px 28px 24px;
  background: var(--pal-surface);
  border: 1px solid var(--pal-border);
  border-radius: var(--pal-radius);
  box-shadow: var(--pal-shadow);
}

.brand { display: flex; align-items: center; gap: 12px; margin-bottom: 28px; }
.brand-mark {
  display: grid; place-items: center;
  width: 48px; height: 48px; border-radius: var(--pal-radius-sm);
  background: var(--pal-accent-soft);
  color: var(--pal-accent);
  border: 1px solid rgba(34, 197, 94, .35);
}
.brand-title { margin: 0; font-size: 20px; font-weight: 700; color: var(--pal-text); letter-spacing: .5px; }
.brand-sub { margin: 2px 0 0; font-size: 13px; color: var(--pal-text-muted); }

.form { margin-top: 4px; }
.btn { width: 100%; font-weight: 600; letter-spacing: 2px; }

.foot {
  margin: 20px 0 0; text-align: center;
  font-family: var(--pal-font-mono);
  font-size: 11px; color: var(--pal-text-faint); letter-spacing: .3px;
}
</style>
