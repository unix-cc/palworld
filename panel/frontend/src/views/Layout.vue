<template>
  <el-container class="layout">
    <el-aside width="210px" class="aside">
      <div class="logo">🎮 帕鲁面板</div>
      <el-menu :default-active="$route.path" router class="menu" background-color="#1f2d3d"
               text-color="#c0ccda" active-text-color="#409eff">
        <el-menu-item index="/dashboard"><el-icon><Odometer /></el-icon><span>仪表盘</span></el-menu-item>
        <el-menu-item index="/players"><el-icon><User /></el-icon><span>玩家管理</span></el-menu-item>
        <el-menu-item index="/console"><el-icon><ChatDotRound /></el-icon><span>广播 / 控制</span></el-menu-item>
        <el-menu-item index="/settings"><el-icon><Setting /></el-icon><span>服务器设置</span></el-menu-item>
        <el-menu-item index="/backups"><el-icon><FolderOpened /></el-icon><span>存档备份</span></el-menu-item>
        <el-menu-item index="/tasks"><el-icon><Timer /></el-icon><span>计划任务</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="page-title">{{ pageTitle }}</span>
        <el-button text type="danger" @click="logout"><el-icon><SwitchButton /></el-icon>退出</el-button>
      </el-header>
      <el-main><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const titles = {
  dashboard: '仪表盘', players: '玩家管理', console: '广播 / 控制',
  settings: '服务器设置', backups: '存档备份', tasks: '计划任务',
}
const pageTitle = computed(() => titles[route.name] || '')
function logout() {
  localStorage.removeItem('token')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.layout { height: 100%; }
.aside { background: #1f2d3d; }
.logo { color: #fff; font-size: 18px; font-weight: 600; text-align: center; padding: 18px 0; }
.menu { border-right: none; }
.header { display: flex; align-items: center; justify-content: space-between;
  background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.page-title { font-size: 18px; font-weight: 600; }
</style>
