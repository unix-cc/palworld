/** 备份服务: 列表 / 创建 / 恢复 / 删除。 */
import { api } from '@/lib/api'
import type { Backup } from '@/types/api'

export async function fetchBackups(): Promise<Backup[]> {
  const { data } = await api.get<Backup[]>('/api/backups')
  return data
}

export async function createBackup(): Promise<{ name: string; size_mb: number }> {
  const { data } = await api.post('/api/backups')
  return data
}

export async function restoreBackup(name: string): Promise<{ restored: string }> {
  const { data } = await api.post('/api/backups/restore', { name })
  return data
}

export async function deleteBackup(name: string): Promise<{ message?: string }> {
  const { data } = await api.delete(`/api/backups/${encodeURIComponent(name)}`)
  return data
}
