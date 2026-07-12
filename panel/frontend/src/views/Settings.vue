<template>
  <el-card>
    <template #header>
      <div class="pal-card-hd">
        <div class="hd-left">
          <span>服务器配置</span>
          <span class="pal-mono pal-hd-file">PalWorldSettings.ini</span>
          <el-tag type="warning" size="small" effect="dark" round>修改后需重启生效</el-tag>
        </div>
        <el-button :icon="Refresh" circle @click="load" :loading="loading" />
      </div>
    </template>

    <el-alert v-if="err" :title="err" type="error" :closable="false" style="margin-bottom: 12px" />

    <el-alert
      type="info" :closable="false" show-icon style="margin-bottom: 12px"
      title="说明"
      description="配置项按官方文档分为四类。带「由启动配置管理」标记的项由 game/server.env 在每次启动时写入, 此处修改会在下次重启被覆盖, 请到 server.env 修改。未在文档内出现的其它项归到「其它」页, 保留原样编辑。"
    />

    <el-tabs v-model="activeTab" v-loading="loading">
      <el-tab-pane
        v-for="cat in CATEGORIES" :key="cat.key"
        :label="`${cat.title} (${grouped[cat.key]?.length || 0})`"
        :name="cat.key"
      >
        <el-alert :title="cat.tip" type="info" :closable="false" style="margin-bottom: 12px" />
        <el-form label-width="180px" label-position="left">
          <el-form-item v-for="row in grouped[cat.key]" :key="row.key">
            <template #label>
              <span>{{ row.meta.label }}</span>
              <el-tooltip v-if="row.meta.note" :content="row.meta.note" placement="top">
                <el-tag size="small" type="danger" effect="plain" style="margin-left:4px">!</el-tag>
              </el-tooltip>
            </template>

            <div style="width: 100%">
              <div class="field-row">
                <!-- 布尔 -->
                <el-switch v-if="row.meta.type === 'bool'" v-model="row.value" :disabled="row.meta.managed" />
                <!-- 下拉 -->
                <el-select v-else-if="row.meta.type === 'select'" v-model="row.value"
                  :disabled="row.meta.managed" style="width: 240px">
                  <el-option v-for="o in row.meta.options" :key="o" :label="o" :value="o" />
                </el-select>
                <!-- 整数 -->
                <el-input-number v-else-if="row.meta.type === 'int'" v-model="row.value"
                  :disabled="row.meta.managed" :step="1" :controls="true" style="width: 200px" />
                <!-- 浮点 (倍率) -->
                <el-input-number v-else-if="row.meta.type === 'float'" v-model="row.value"
                  :disabled="row.meta.managed" :step="0.1" :precision="6" :controls="true" style="width: 200px" />
                <!-- 文本 -->
                <el-input v-else v-model="row.value" :disabled="row.meta.managed"
                  size="default" style="max-width: 360px" />

                <el-tag v-if="row.meta.managed" size="small" type="info">由启动配置管理</el-tag>
                <span class="raw-key pal-mono">{{ row.key }}</span>
              </div>
              <div class="desc">{{ row.meta.desc }}</div>
            </div>
          </el-form-item>

          <el-empty v-if="!grouped[cat.key]?.length" description="该分类暂无配置项" />
        </el-form>
      </el-tab-pane>

      <!-- 未识别的其它项: 原样文本编辑, 保证不丢配置 -->
      <el-tab-pane :label="`其它 (${others.length})`" name="others" v-if="others.length">
        <el-alert title="文档未收录 / 新版本新增的配置项, 原样以文本编辑。" type="info" :closable="false" style="margin-bottom: 12px" />
        <el-form label-width="320px" label-position="left">
          <el-form-item v-for="row in others" :key="row.key">
            <template #label><span class="pal-mono">{{ row.key }}</span></template>
            <el-input v-model="row.value" size="default" style="max-width: 360px" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <div class="save-bar">
      <el-button type="primary" :icon="Check" @click="save" :loading="saving">保存配置</el-button>
      <el-button type="warning" :icon="RefreshRight" @click="saveAndRestart" :loading="saving">保存并重启</el-button>
    </div>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, RefreshRight, Check } from '@element-plus/icons-vue'
import api from '../api'
import { CATEGORIES, SCHEMA, toIniValue, fromIniValue } from '../settings_schema'

const loading = ref(false)
const saving = ref(false)
const err = ref('')
const activeTab = ref(CATEGORIES[0].key)

// 按分类分组的已知项 + 未识别项
const grouped = reactive({})
const others = ref([])
CATEGORIES.forEach((c) => { grouped[c.key] = [] })

async function load() {
  loading.value = true; err.value = ''
  try {
    const { data } = await api.get('/api/settings/ini')
    CATEGORIES.forEach((c) => { grouped[c.key] = [] })
    others.value = []
    for (const [key, raw] of Object.entries(data)) {
      const meta = SCHEMA[key]
      if (meta) {
        grouped[meta.cat].push({ key, meta, value: fromIniValue(meta.type, raw) })
      } else {
        others.value.push({ key, value: String(raw).replace(/^"|"$/g, '') })
      }
    }
  } catch (e) { err.value = e.response?.data?.detail || '读取失败' }
  finally { loading.value = false }
}

function collectUpdates() {
  const updates = {}
  // 已知项: 按类型转 ini 值; managed 项跳过(交给 server.env)
  for (const c of CATEGORIES) {
    for (const row of grouped[c.key]) {
      if (row.meta.managed) continue
      let v = toIniValue(row.meta.type, row.value)
      // 文本/下拉/种子等含字符串的项, 写入时补引号 (bool/数值不加)
      if (row.meta.type === 'text' || row.meta.type === 'select') {
        v = `"${String(row.value).replace(/^"|"$/g, '')}"`
      }
      updates[row.key] = v
    }
  }
  // 其它项: 原样(补引号以防含逗号)
  for (const row of others.value) {
    const s = String(row.value)
    updates[row.key] = /[",]/.test(s) && !/^".*"$/.test(s) ? `"${s.replace(/"/g, '')}"` : s
  }
  return updates
}

async function doSave() {
  await api.put('/api/settings/ini', { updates: collectUpdates() })
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

<style scoped>
.pal-card-hd { display: flex; align-items: center; justify-content: space-between; }
.hd-left { display: flex; align-items: center; gap: 10px; }
.pal-hd-file { color: var(--pal-text-muted); font-size: 12px; }
.field-row { display: flex; align-items: center; gap: 8px; }
.desc { color: var(--pal-text-muted); font-size: 12px; line-height: 1.5; margin-top: 4px; }
.raw-key { color: var(--pal-text-faint); font-size: 12px; }
.save-bar {
  margin-top: 16px; padding-top: 16px;
  border-top: 1px solid var(--pal-border-soft);
  display: flex; gap: 12px;
}
</style>
