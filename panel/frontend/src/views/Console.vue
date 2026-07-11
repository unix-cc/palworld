<template>
  <el-row :gutter="16">
    <el-col :span="10">
      <el-card>
        <template #header>全服广播</template>
        <el-input v-model="msg" type="textarea" :rows="3" placeholder="输入广播内容 (仅支持英文/数字)" />
        <el-button type="primary" style="margin-top: 12px" @click="announce">发送广播</el-button>
      </el-card>
      <el-card style="margin-top: 16px;">
        <template #header>定时关服</template>
        <el-form label-width="80px">
          <el-form-item label="倒计时(秒)"><el-input-number v-model="seconds" :min="5" :max="3600" /></el-form-item>
          <el-form-item label="提示语"><el-input v-model="shutMsg" /></el-form-item>
        </el-form>
        <el-popconfirm title="确定倒计时关服?" @confirm="shutdown">
          <template #reference><el-button type="danger">关服</el-button></template>
        </el-popconfirm>
      </el-card>
    </el-col>
    <el-col :span="14">
      <el-card>
        <template #header>
          <span>容器日志</span>
          <el-button style="float:right" :icon="Refresh" circle @click="loadLogs" :loading="loading" />
        </template>
        <pre class="logs">{{ logs || '暂无日志' }}</pre>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import api from '../api'

const msg = ref('')
const seconds = ref(30)
const shutMsg = ref('Server will shutdown soon.')
const logs = ref('')
const loading = ref(false)
let timer = null

async function announce() {
  if (!msg.value) return
  try { await api.post('/api/server/announce', { message: msg.value }); ElMessage.success('已广播'); msg.value = '' }
  catch (e) { ElMessage.error(e.response?.data?.detail || '广播失败') }
}
async function shutdown() {
  try { await api.post('/api/server/shutdown', { seconds: seconds.value, message: shutMsg.value }); ElMessage.success('已发起关服倒计时') }
  catch (e) { ElMessage.error(e.response?.data?.detail || '操作失败') }
}
async function loadLogs() {
  loading.value = true
  try { logs.value = (await api.get('/api/server/logs?tail=300')).data.logs }
  catch (e) { ElMessage.error(e.response?.data?.detail || '获取日志失败') }
  finally { loading.value = false }
}

onMounted(() => { loadLogs(); timer = setInterval(loadLogs, 8000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.logs { background: #1e1e1e; color: #d4d4d4; padding: 12px; border-radius: 4px;
  height: 480px; overflow: auto; font-size: 12px; white-space: pre-wrap; word-break: break-all; margin: 0; }
</style>
