<template>
  <el-card>
    <template #header>
      <div class="pal-card-hd">
        <span>计划任务</span>
        <span class="pal-hd-sub">定时重启 / 定时备份</span>
      </div>
    </template>

    <el-form :inline="true" class="task-form" @submit.prevent="add">
      <el-form-item label="类型">
        <el-select v-model="form.action" style="width: 130px">
          <el-option label="定时重启" value="restart" />
          <el-option label="定时备份" value="backup" />
        </el-select>
      </el-form-item>
      <el-form-item label="预设">
        <el-select v-model="preset" style="width: 180px" @change="applyPreset" clearable placeholder="快速选择">
          <el-option label="每天 05:00" value="0 5 * * *" />
          <el-option label="每天 04:00" value="0 4 * * *" />
          <el-option label="每 6 小时" value="0 */6 * * *" />
          <el-option label="每 12 小时" value="0 */12 * * *" />
          <el-option label="每周三 05:00" value="0 5 * * 3" />
        </el-select>
      </el-form-item>
      <el-form-item label="Cron">
        <el-input v-model="form.cron" placeholder="分 时 日 月 周" style="width: 180px" class="pal-mono" />
      </el-form-item>
      <el-button type="primary" :icon="Plus" @click="add">添加</el-button>
    </el-form>

    <el-table :data="tasks" v-loading="loading" empty-text="暂无计划任务" style="margin-top: 8px">
      <el-table-column label="类型" width="120">
        <template #default="{ row }">
          <el-tag :type="row.action === 'restart' ? 'warning' : 'success'" effect="dark" round>
            {{ row.action === 'restart' ? '定时重启' : '定时备份' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="cron" label="触发规则" min-width="220">
        <template #default="{ row }"><span class="pal-mono">{{ row.cron }}</span></template>
      </el-table-column>
      <el-table-column prop="next_run" label="下次执行" width="200">
        <template #default="{ row }"><span class="pal-mono">{{ row.next_run || '-' }}</span></template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="确定删除该任务?" @confirm="remove(row)">
            <template #reference><el-button size="small" type="danger" :icon="Delete">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import api from '../api'

const tasks = ref([])
const loading = ref(false)
const preset = ref('')
const form = reactive({ action: 'restart', cron: '0 5 * * *' })

function applyPreset(v) { if (v) form.cron = v }
async function load() {
  loading.value = true
  try { tasks.value = (await api.get('/api/tasks')).data }
  finally { loading.value = false }
}
async function add() {
  try { await api.post('/api/tasks', { action: form.action, cron: form.cron }); ElMessage.success('已添加'); load() }
  catch (e) { ElMessage.error(e.response?.data?.detail || '添加失败, 请检查 Cron 格式') }
}
async function remove(row) {
  try { await api.delete(`/api/tasks/${row.id}`); ElMessage.success('已删除'); load() }
  catch (e) { ElMessage.error(e.response?.data?.detail || '删除失败') }
}

onMounted(load)
</script>

<style scoped>
.pal-card-hd { display: flex; align-items: baseline; gap: 10px; }
.pal-hd-sub { color: var(--pal-text-muted); font-size: 12px; font-weight: 400; }
.task-form { padding: 4px 0; }
</style>
