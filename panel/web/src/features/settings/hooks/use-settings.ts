/** 设置 (INI) Query/Mutation 钩子。 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-keys'
import { apiError } from '@/lib/api'
import { fetchIni, updateIni } from '../services/settings-service'

/** 读取 PalWorldSettings.ini。 */
export function useIniSettings() {
  return useQuery({
    queryKey: queryKeys.settings.ini,
    queryFn: fetchIni,
  })
}

/** 写入配置 (需重启生效)。 */
export function useUpdateIni() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (updates: Record<string, string>) => updateIni(updates),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.settings.ini })
    },
    onError: (err) => toast.error(apiError(err, '保存失败')),
  })
}
