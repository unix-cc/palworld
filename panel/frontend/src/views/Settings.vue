<template>
  <el-card>
    <template #header>
      <span>服务器配置 (PalWorldSettings.ini)</span>
      <el-tag type="warning" size="small" style="margin-left: 8px">修改后需重启生效</el-tag>
      <el-button style="float:right" :icon="Refresh" circle @click="load" :loading="loading" />
    </template>

    <el-alert v-if="err" :title="err" type="error" :closable="false" style="margin-bottom: 12px" />

    <el-table :data="rows" v-loading="loading" max-height="520">
      <el-table-column prop="key" label="配置项" min-width="240" />
      <el-table-column label="值" min-width="260">
        <template #default="{ row }"><el-input v-model="row.value" size="small" /></template>
      </el-table-column>
    </el-table>

    <div style="margin-top: 16px;">
      <el-button type="primary" @click="save" :loading="saving">保存配置</el-button>
      <el-button type="warning" @click="saveAndRestart" :loading="saving">保存并重启</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import api from '../api'

const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const err = ref('')

async function load() {
  loading.value = true; err.value = ''
  try {
    const { data } = await api.get('/api/settings/ini')
    rows.value = Object.entries(data).map(([key, value]) => ({ key, value }))
  } catch (e) { err.value = e.response?.data?.detail || '读取失败' }
  finally { loading.value = false }
}
async function doSave() {
  const updates = {}
  rows.value.forEach((r) => { updates[r.key] = r.value })
  await api.put('/api/settings/ini', { updates })
}
async function save() {
  saving.value = true
  try { await doSave(); ElMessage.success('已保存, 重启后生效') }
  catch (e) { ElMessage.error(e.response?.data?.detail || '保存失败') }
  finally { saving.value = false }
}
async function saveAndRestart() {
  saving.value = true
  try { await doSave(); await api.post('/api/server/restart'); ElMessage.success('已保存并重启') }
  catch (e) { ElMessage.error(e.response?.data?.detail || '操作失败') }
  finally { saving.value = false }
}

onMounted(load)
</script>
