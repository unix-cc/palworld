<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="6"><el-card><div class="stat"><div class="label">运行状态</div>
        <el-tag :type="status.status === 'running' ? 'success' : 'info'" size="large">
          {{ status.status || '未知' }}</el-tag></div></el-card></el-col>
      <el-col :span="6"><el-card><div class="stat"><div class="label">在线玩家</div>
        <div class="value">{{ metrics.currentplayernum ?? '-' }} / {{ metrics.maxplayernum ?? '-' }}</div></div></el-card></el-col>
      <el-col :span="6"><el-card><div class="stat"><div class="label">服务器 FPS</div>
        <div class="value">{{ metrics.serverfps ?? '-' }}</div></div></el-card></el-col>
      <el-col :span="6"><el-card><div class="stat"><div class="label">游戏内天数</div>
        <div class="value">{{ metrics.days ?? '-' }}</div></div></el-card></el-col>
    </el-row>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="12"><el-card>
        <template #header>资源占用 (容器)</template>
        <div class="res"><span>CPU</span>
          <el-progress :percentage="pct(status.cpu_percent)" :status="barStatus(status.cpu_percent)" /></div>
        <div class="res"><span>内存</span>
          <el-progress :percentage="pct(status.mem_percent)" :status="barStatus(status.mem_percent)" />
          <small>{{ status.mem_used_mb ?? '-' }} / {{ status.mem_limit_mb ?? '-' }} MB</small></div>
      </el-card></el-col>
      <el-col :span="12"><el-card>
        <template #header>服务器信息</template>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="名称">{{ info.servername || '-' }}</el-descriptions-item>
          <el-descriptions-item label="版本">{{ info.version || '-' }}</el-descriptions-item>
          <el-descriptions-item label="运行时长">{{ uptime }}</el-descriptions-item>
          <el-descriptions-item label="世界GUID">{{ info.worldguid || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card></el-col>
    </el-row>

    <el-card style="margin-top: 16px;">
      <template #header>服务器控制</template>
      <el-button type="success" :icon="VideoPlay" @click="act('start','启动')">启动</el-button>
      <el-button type="warning" :icon="RefreshRight" @click="act('restart','重启')">重启</el-button>
      <el-button type="primary" :icon="DocumentChecked" @click="act('save','存档')">立即存档</el-button>
      <el-popconfirm title="确定停止服务器?" @confirm="act('stop','停止')">
        <template #reference><el-button type="danger" :icon="VideoPause">停止</el-button></template>
      </el-popconfirm>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, RefreshRight, DocumentChecked } from '@element-plus/icons-vue'
import api from '../api'

const status = ref({})
const info = ref({})
const metrics = ref({})
let timer = null

const pct = (v) => (v == null ? 0 : Math.min(100, Math.round(v)))
const barStatus = (v) => (v == null ? '' : v > 90 ? 'exception' : v > 70 ? 'warning' : 'success')
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
.stat { text-align: center; padding: 6px 0; }
.label { color: #909399; font-size: 13px; margin-bottom: 8px; }
.value { font-size: 28px; font-weight: 600; color: #303133; }
.res { margin-bottom: 18px; }
.res span { display: inline-block; width: 42px; }
.res small { color: #909399; }
</style>
