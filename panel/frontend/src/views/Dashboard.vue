<template>
  <div>
    <!-- KPI 卡片密集网格 (skill: Data-Dense Dashboard) -->
    <div class="kpi-grid">
      <div class="kpi" :class="{ 'kpi--live': isRunning }">
        <div class="kpi-top">
          <span class="kpi-label">运行状态</span>
          <span class="dot" :class="isRunning ? 'dot--on' : 'dot--off'"></span>
        </div>
        <div class="kpi-value">
          <span :class="isRunning ? 'txt-accent' : 'txt-muted'">{{ statusText }}</span>
        </div>
      </div>

      <div class="kpi">
        <div class="kpi-top"><span class="kpi-label">在线玩家</span><el-icon class="kpi-ic"><User /></el-icon></div>
        <div class="kpi-value pal-num">{{ metrics.currentplayernum ?? '-' }}<span class="kpi-sub"> / {{ metrics.maxplayernum ?? '-' }}</span></div>
      </div>

      <div class="kpi">
        <div class="kpi-top"><span class="kpi-label">服务器 FPS</span><el-icon class="kpi-ic"><Odometer /></el-icon></div>
        <div class="kpi-value pal-num" :class="fpsClass">{{ metrics.serverfps ?? '-' }}</div>
      </div>

      <div class="kpi">
        <div class="kpi-top"><span class="kpi-label">游戏内天数</span><el-icon class="kpi-ic"><Calendar /></el-icon></div>
        <div class="kpi-value pal-num">{{ metrics.days ?? '-' }}</div>
      </div>
    </div>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>资源占用 (容器)</template>
          <div class="res">
            <span class="res-k">CPU</span>
            <el-progress :percentage="pct(status.cpu_percent)" :color="barColor(status.cpu_percent)"
                         :stroke-width="10" class="res-bar" />
          </div>
          <div class="res">
            <span class="res-k">内存</span>
            <el-progress :percentage="pct(status.mem_percent)" :color="barColor(status.mem_percent)"
                         :stroke-width="10" class="res-bar" />
            <small class="pal-num">{{ status.mem_used_mb ?? '-' }} / {{ status.mem_limit_mb ?? '-' }} MB</small>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>服务器信息</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="名称">{{ info.servername || '-' }}</el-descriptions-item>
            <el-descriptions-item label="版本"><span class="pal-mono">{{ info.version || '-' }}</span></el-descriptions-item>
            <el-descriptions-item label="运行时长">{{ uptime }}</el-descriptions-item>
            <el-descriptions-item label="世界GUID"><span class="pal-mono txt-muted">{{ info.worldguid || '-' }}</span></el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <template #header>服务器控制</template>
      <div class="controls">
        <el-button type="success" :icon="VideoPlay" :disabled="isRunning" @click="act('start','启动')">启动</el-button>
        <el-button type="warning" :icon="RefreshRight" @click="act('restart','重启')">重启</el-button>
        <el-button type="primary" :icon="DocumentChecked" @click="act('save','存档')">立即存档</el-button>
        <el-popconfirm title="确定停止服务器?" confirm-button-type="danger" @confirm="act('stop','停止')">
          <template #reference><el-button type="danger" :icon="VideoPause" :disabled="!isRunning">停止</el-button></template>
        </el-popconfirm>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, RefreshRight, DocumentChecked,
         User, Odometer, Calendar } from '@element-plus/icons-vue'
import api from '../api'

const status = ref({})
const info = ref({})
const metrics = ref({})
let timer = null

const isRunning = computed(() => status.value.status === 'running')
const statusText = computed(() => {
  const map = { running: '运行中', stopped: '已停止', starting: '启动中', exited: '已退出' }
  return map[status.value.status] || status.value.status || '未知'
})
const fpsClass = computed(() => {
  const f = metrics.value.serverfps
  if (f == null) return 'txt-muted'
  return f >= 50 ? 'txt-accent' : f >= 25 ? 'txt-warning' : 'txt-danger'
})

const pct = (v) => (v == null ? 0 : Math.min(100, Math.round(v)))
const barColor = (v) => (v == null ? '#334155' : v > 90 ? '#EF4444' : v > 70 ? '#F59E0B' : '#22C55E')
const uptime = computed(() => {
  const s = metrics.value.uptime
  if (!s) return '-'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return `${h}小时${m}分`
})

async function refresh() {
  try { status.value = (await api.get('/api/server/status')).data } catch {}
  try {
    const { data } = await api.get('/api/server/overview')
    info.value = data.info || {}
    metrics.value = data.metrics || {}
  } catch {}
}
async function act(ep, label) {
  try { await api.post(`/api/server/${ep}`); ElMessage.success(`${label}成功`); setTimeout(refresh, 1500) }
  catch (e) { ElMessage.error(e.response?.data?.detail || `${label}失败`) }
}

onMounted(() => { refresh(); timer = setInterval(refresh, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
/* KPI 密集网格: 自适应, 最窄 200px 一列 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--pal-space-4);
}
.kpi {
  background: var(--pal-surface);
  border: 1px solid var(--pal-border-soft);
  border-radius: var(--pal-radius);
  padding: var(--pal-space-4) var(--pal-space-5);
  box-shadow: var(--pal-shadow);
}
.kpi--live { border-color: rgba(34, 197, 94, 0.4); }
.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--pal-space-3); }
.kpi-label { color: var(--pal-text-muted); font-size: 13px; }
.kpi-ic { color: var(--pal-text-faint); font-size: 16px; }
.kpi-value { font-size: 30px; font-weight: 700; line-height: 1.1; color: var(--pal-text); }
.kpi-sub { font-size: 16px; font-weight: 500; color: var(--pal-text-faint); }

.txt-accent { color: var(--pal-accent); }
.txt-warning { color: var(--pal-warning); }
.txt-danger { color: var(--pal-danger); }
.txt-muted { color: var(--pal-text-muted); }

/* 状态指示灯 */
.dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.dot--on { background: var(--pal-accent); box-shadow: 0 0 0 3px var(--pal-accent-soft); animation: pulse 2s infinite; }
.dot--off { background: var(--pal-text-faint); }
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 3px var(--pal-accent-soft); }
  50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.05); }
}
@media (prefers-reduced-motion: reduce) { .dot--on { animation: none; } }

.res { display: flex; align-items: center; gap: var(--pal-space-3); margin-bottom: var(--pal-space-5); }
.res:last-child { margin-bottom: 0; }
.res-k { width: 42px; color: var(--pal-text-muted); font-size: 13px; flex-shrink: 0; }
.res-bar { flex: 1; }
.res small { color: var(--pal-text-muted); flex-shrink: 0; }

.controls { display: flex; flex-wrap: wrap; gap: var(--pal-space-3); }
</style>
