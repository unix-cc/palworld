/**
 * 集中式 Query Key 工厂。
 * 所有 useQuery/useMutation 的失效都从这里取 key, 避免散落的字符串数组。
 */
export const queryKeys = {
  server: {
    status: ['server', 'status'] as const,
    overview: ['server', 'overview'] as const,
    logs: (tail: number) => ['server', 'logs', tail] as const,
  },
  players: ['players'] as const,
  settings: {
    ini: ['settings', 'ini'] as const,
    live: ['settings', 'live'] as const,
  },
  backups: ['backups'] as const,
  tasks: ['tasks'] as const,
  auth: {
    me: ['auth', 'me'] as const,
  },
} as const
