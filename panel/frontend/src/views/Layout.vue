<template>
  <el-container class="layout">
    <el-aside :width="collapsed ? '64px' : '220px'" class="aside">
      <div class="brand" :class="{ mini: collapsed }">
        <el-icon class="brand-icon"><Monitor /></el-icon>
        <span v-show="!collapsed" class="brand-text">帕鲁面板</span>
      </div>
      <el-menu :default-active="$route.path" router class="menu" :collapse="collapsed" :collapse-transition="false">
        <el-menu-item v-for="n in navs" :key="n.path" :index="n.path">
          <el-icon><component :is="n.icon" /></el-icon>
          <template #title><span>{{ n.label }}</span></template>
        </el-menu-item>
      </el-menu>
      <div class="aside-foot" v-show="!collapsed">
        <span class="ver">v1.0</span>
      </div>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="hl">
          <el-button text class="collapse-btn" :aria-label="collapsed ? '展开菜单' : '收起菜单'" @click="collapsed = !collapsed">
            <el-icon><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
          </el-button>
          <span class="page-title">{{ pageTitle }}</span>
        </div>
        <div class="hr">
          <span class="srv-status" :class="statusClass">
            <i class="dot" /> {{ statusText }}
          </span>
          <el-button text class="logout" @click="logout">
            <el-icon><SwitchButton /></el-icon><span>退出</span>
          </el-button>
        </div>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Odometer, User, ChatDotRound, Setting, FolderOpened, Timer,
  Monitor, SwitchButton, Fold, Expand,
} from '@element-plus/icons-vue'
import api from '../api'

const route = useRoute()
const router = useRouter()

const navs = [
  { path: '/dashboard', label: '仪表盘', icon: Odometer },
  { path: '/players', label: '玩家管理', icon: User },
  { path: '/console', label: '广播 / 控制', icon: ChatDotRound },
  { path: '/settings', label: '服务器设置', icon: Setting },
  { path: '/backups', label: '存档备份', icon: FolderOpened },
  { path: '/tasks', label: '计划任务', icon: Timer },
]

const collapsed = ref(false)
const pageTitle = computed(() => {
  const hit = navs.find((n) => n.path === route.path)
  return hit ? hit.label : ''
})

// 头部实时服务器状态指示 (轻量轮询)
const running = ref(null) // null=未知, true/false
const statusText = computed(() =>
  running.value === null ? '连接中' : running.value ? '运行中' : '已停止'
)
const statusClass = computed(() =>
  running.value === null ? 'is-unknown' : running.value ? 'is-up' : 'is-down'
)
let timer = null
async function pollStatus() {
  try {
    const { data } = await api.get('/api/server/status')
    running.value = !!data.running
  } catch (e) { running.value = null }
}

function logout() {
  localStorage.removeItem('token')
  router.push({ name: 'login' })
}

onMounted(() => { pollStatus(); timer = setInterval(pollStatus, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.layout { height: 100%; }

/* ---- 侧栏 ---- */
.aside {
  background: var(--pal-surface);
  border-right: 1px solid var(--pal-border-soft);
  display: flex;
  flex-direction: column;
  transition: width .2s ease;
  overflow: hidden;
}
.brand {
  display: flex; align-items: center; gap: var(--pal-space-3);
  padding: 0 var(--pal-space-5);
  height: 60px;
  border-bottom: 1px solid var(--pal-border-soft);
  white-space: nowrap;
}
.brand.mini { padding: 0; justify-content: center; }
.brand-icon { font-size: 24px; color: var(--pal-accent); }
.brand-text { font-size: 17px; font-weight: 700; color: var(--pal-text); letter-spacing: .5px; }

.menu { border-right: none; flex: 1; padding: var(--pal-space-2) var(--pal-space-2) 0; background: transparent; }
.menu:not(.el-menu--collapse) { width: 100%; }
.menu :deep(.el-menu-item) {
  border-radius: var(--pal-radius-sm);
  margin-bottom: 4px;
  height: 46px;
  color: var(--pal-text-muted);
}
.menu :deep(.el-menu-item:hover) { background: var(--pal-surface-2); color: var(--pal-text); }
.menu :deep(.el-menu-item.is-active) {
  background: var(--pal-accent-soft);
  color: var(--pal-accent);
  font-weight: 600;
}
/* 当前位置左侧高亮条 (skill: nav-state-active) */
.menu :deep(.el-menu-item.is-active)::before {
  content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
  width: 3px; border-radius: 0 3px 3px 0; background: var(--pal-accent);
}
.aside-foot { padding: var(--pal-space-3) var(--pal-space-5); border-top: 1px solid var(--pal-border-soft); }
.ver { color: var(--pal-text-faint); font-size: 12px; font-family: var(--pal-font-mono); }

/* ---- 头部 ---- */
.header {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--pal-surface);
  border-bottom: 1px solid var(--pal-border-soft);
  height: 60px;
}
.hl, .hr { display: flex; align-items: center; gap: var(--pal-space-3); }
.collapse-btn { font-size: 18px; color: var(--pal-text-muted); }
.page-title { font-size: 18px; font-weight: 600; color: var(--pal-text); }

.srv-status {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; padding: 4px 12px; border-radius: 999px;
  border: 1px solid var(--pal-border);
}
.srv-status .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.srv-status.is-up { color: var(--pal-accent); border-color: var(--pal-accent); background: var(--pal-accent-soft); }
.srv-status.is-up .dot { animation: pulse 1.6s ease-in-out infinite; }
.srv-status.is-down { color: var(--pal-danger); border-color: var(--pal-danger); background: rgba(239,68,68,.12); }
.srv-status.is-unknown { color: var(--pal-text-faint); }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }

.logout { color: var(--pal-text-muted); }
.logout:hover { color: var(--pal-danger); }
.logout span { margin-left: 4px; }

@media (prefers-reduced-motion: reduce) {
  .srv-status.is-up .dot { animation: none; }
}
</style>
