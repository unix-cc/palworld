/** 设置服务: 读取 / 写入 PalWorldSettings.ini。 */
import { api } from '@/lib/api'
import type { IniSettings } from '@/types/api'

export async function fetchIni(): Promise<IniSettings> {
  const { data } = await api.get<IniSettings>('/api/settings/ini')
  return data
}

export async function updateIni(updates: Record<string, string>): Promise<{ updated_keys: string[] }> {
  const { data } = await api.put('/api/settings/ini', { updates })
  return data
}
