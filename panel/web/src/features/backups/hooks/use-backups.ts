/** 备份 Query/Mutation 钩子。 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/lib/api'
import { createBackup, deleteBackup, fetchBackups, restoreBackup } from '../services/backups-service'

export function useBackups() {
  return useQuery({
    queryKey: queryKeys.backups,
    queryFn: fetchBackups,
  })
}

export function useCreateBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createBackup,
    onSuccess: () => {
      toast.success('备份完成')
      void qc.invalidateQueries({ queryKey: queryKeys.backups })
    },
    onError: (err) => toast.error(apiError(err, '备份失败')),
  })
}

export function useRestoreBackup() {
  return useMutation({
    mutationFn: (name: string) => restoreBackup(name),
    onSuccess: () => toast.success('恢复成功, 请重启服务器'),
    onError: (err) => toast.error(apiError(err, '恢复失败')),
  })
}

export function useDeleteBackup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => deleteBackup(name),
    onSuccess: () => {
      toast.success('已删除')
      void qc.invalidateQueries({ queryKey: queryKeys.backups })
    },
    onError: (err) => toast.error(apiError(err, '删除失败')),
  })
}
