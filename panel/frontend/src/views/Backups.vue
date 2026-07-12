<template>
  <el-card>
    <template #header>
      <div class="pal-card-hd">
        <span>存档备份 <span class="pal-count">{{ backups.length }}</span></span>
        <el-button type="primary" :icon="Plus" @click="create" :loading="creating">立即备份</el-button>
      </div>
    </template>
    <el-table :data="backups" v-loading="loading" empty-text="暂无备份">
      <el-table-column prop="name" label="文件名" min-width="240">
        <template #default="{ row }"><span class="pal-mono">{{ row.name }}</span></template>
      </el-table-column>
      <el-table-column prop="size_mb" label="大小(MB)" width="120" align="right">
        <template #default="{ row }"><span class="pal-num">{{ row.size_mb }}</span></template>
      </el-table-column>
      <el-table-column prop="created" label="创建时间" width="200">
        <template #default="{ row }"><span class="pal-mono">{{ row.created }}</span></template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-popconfirm title="恢复将覆盖当前存档, 确定?" @confirm="restore(row)" width="240">
            <template #reference><el-button size="small" type="warning">恢复</el-button></template>
          </el-popconfirm>
          <el-popconfirm title="确定删除该备份?" @confirm="remove(row)" width="220">
            <template #reference><el-button size="small" type="danger">删除</el-button></template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <el-alert style="margin-top: 12px" type="info" :closable="false" show-icon
      title="恢复存档会先自动备份当前存档以便回滚。恢复后建议重启服务器。" />
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import api from '../api'

const backups = ref([])
const loading = ref(false)
const creating = ref(false)

async function load() {
  loading.value = true
  try { backups.value = (await api.get('/api/backups')).data }
  finally { loading.value = false }
}
async function create() {
  creating.value = true
  try { await api.post('/api/backups'); ElMessage.success('备份完成'); load() }
  catch (e) { ElMessage.error(e.response?.data?.detail || '备份失败') }
  finally { creating.value = false }
}
async function restore(row) {
  try { await api.post('/api/backups/restore', { name: row.name }); ElMessage.success('恢复成功, 请重启服务器') }
  catch (e) { ElMessage.error(e.response?.data?.detail || '恢复失败') }
}
async function remove(row) {
  try { await api.delete(`/api/backups/${encodeURIComponent(row.name)}`); ElMessage.success('已删除'); load() }
  catch (e) { ElMessage.error(e.response?.data?.detail || '删除失败') }
}

onMounted(load)
</script>

<style scoped>
.pal-card-hd { display: flex; align-items: center; justify-content: space-between; }
.pal-count {
  display: inline-block; min-width: 20px; padding: 0 7px; margin-left: 4px;
  font-family: var(--pal-font-mono); font-size: 12px; line-height: 20px; text-align: center;
  color: var(--pal-accent); background: var(--pal-accent-soft); border-radius: 10px;
}
</style>
