<template>
  <el-card>
    <template #header>
      <span>在线玩家 ({{ players.length }})</span>
      <el-button style="float:right" :icon="Refresh" circle @click="load" :loading="loading" />
    </template>
    <el-table :data="players" v-loading="loading" empty-text="暂无在线玩家">
      <el-table-column prop="name" label="昵称" min-width="120" />
      <el-table-column prop="accountName" label="账号" min-width="120" />
      <el-table-column prop="level" label="等级" width="70" />
      <el-table-column prop="ping" label="延迟" width="90">
        <template #default="{ row }">{{ row.ping != null ? Math.round(row.ping) + 'ms' : '-' }}</template>
      </el-table-column>
      <el-table-column prop="userId" label="UserID" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="doAction('kick', row, '踢出')">踢出</el-button>
          <el-popconfirm title="确定封禁该玩家?" @confirm="doAction('ban', row, '封禁')">
            <template #reference><el-button size="small" type="danger">封禁</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-divider />
    <el-form :inline="true" @submit.prevent="unban">
      <el-form-item label="解封 UserID">
        <el-input v-model="unbanId" placeholder="steam_xxx / UserID" style="width: 280px" />
      </el-form-item>
      <el-button type="primary" @click="unban">解封</el-button>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import api from '../api'

const players = ref([])
const loading = ref(false)
const unbanId = ref('')
let timer = null

async function load() {
  loading.value = true
  try { players.value = (await api.get('/api/players')).data.players || [] }
  catch (e) { ElMessage.error(e.response?.data?.detail || '获取玩家失败') }
  finally { loading.value = false }
}
async function doAction(ep, row, label) {
  try { await api.post(`/api/players/${ep}`, { userid: row.userId }); ElMessage.success(`已${label} ${row.name}`); load() }
  catch (e) { ElMessage.error(e.response?.data?.detail || `${label}失败`) }
}
async function unban() {
  if (!unbanId.value) return
  try { await api.post('/api/players/unban', { userid: unbanId.value }); ElMessage.success('已解封'); unbanId.value = '' }
  catch (e) { ElMessage.error(e.response?.data?.detail || '解封失败') }
}

onMounted(() => { load(); timer = setInterval(load, 10000) })
onUnmounted(() => clearInterval(timer))
</script>
