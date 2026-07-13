/** 计划任务服务: 列表 / 添加 / 删除。 */
import { api } from '@/lib/api'
import type { ScheduledTask, TaskAction } from '@/types/api'

export async function fetchTasks(): Promise<ScheduledTask[]> {
  const { data } = await api.get<ScheduledTask[]>('/api/tasks')
  return data
}

export async function addTask(action: TaskAction, cron: string): Promise<{ id: string }> {
  const { data } = await api.post('/api/tasks', { action, cron })
  return data
}

export async function deleteTask(id: string): Promise<{ message?: string }> {
  const { data } = await api.delete(`/api/tasks/${id}`)
  return data
}
