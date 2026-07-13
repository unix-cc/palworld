/** 计划任务 Query/Mutation 钩子。 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/lib/api'
import type { TaskAction } from '@/types/api'
import { addTask, deleteTask, fetchTasks } from '../services/tasks-service'

export function useTasks() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
  })
}

export function useAddTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ action, cron }: { action: TaskAction; cron: string }) => addTask(action, cron),
    onSuccess: () => {
      toast.success('已添加')
      void qc.invalidateQueries({ queryKey: queryKeys.tasks })
    },
    onError: (err) => toast.error(apiError(err, '添加失败, 请检查 Cron 格式')),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success('已删除')
      void qc.invalidateQueries({ queryKey: queryKeys.tasks })
    },
    onError: (err) => toast.error(apiError(err, '删除失败')),
  })
}
