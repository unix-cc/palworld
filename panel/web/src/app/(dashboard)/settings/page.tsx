'use client'

/**
 * 服务器设置页: 编辑 PalWorldSettings.ini 的 OptionSettings。
 * - 已知项按官方四分类分组 (性能/服务器/玩法/平衡), 未知项进「其它」原样文本编辑。
 * - managed 项只读 (由 server.env 启动写入, 此处改会被覆盖)。
 * - 保存: 收集非 managed 项 -> 转 ini 值 (text/select 补引号) -> PUT。
 * - 保存并重启: 保存成功后触发 restart。
 */
import * as React from 'react'
import { RefreshCw, Save, RotateCw, Info } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SettingsField } from '@/features/settings/components/settings-field'
import { useIniSettings, useUpdateIni } from '@/features/settings/hooks/use-settings'
import { useServerAction } from '@/features/server/hooks/use-server'
import {
  CATEGORIES,
  SCHEMA,
  type CategoryKey,
  type FieldValue,
  fromIniValue,
  toIniValue,
} from '@/features/settings/settings-schema'

interface KnownRow {
  key: string
  meta: (typeof SCHEMA)[string]
  value: FieldValue
}
interface OtherRow {
  key: string
  value: string
}

export default function SettingsPage() {
  const { data, isLoading, isError, error, refetch, isFetching, dataUpdatedAt } =
    useIniSettings()
  const updateIni = useUpdateIni()
  const serverAction = useServerAction()

  const [grouped, setGrouped] = React.useState<Record<CategoryKey, KnownRow[]>>({
    performance: [],
    server: [],
    features: [],
    balance: [],
  })
  const [others, setOthers] = React.useState<OtherRow[]>([])
  const [tab, setTab] = React.useState<string>('performance')

  React.useEffect(() => {
    if (!data) return
    const next: Record<CategoryKey, KnownRow[]> = {
      performance: [],
      server: [],
      features: [],
      balance: [],
    }
    const otherRows: OtherRow[] = []
    for (const [key, raw] of Object.entries(data)) {
      const meta = SCHEMA[key]
      if (meta) {
        next[meta.cat].push({ key, meta, value: fromIniValue(meta.type, raw) })
      } else {
        otherRows.push({ key, value: String(raw).replace(/^"|"$/g, '') })
      }
    }
    setGrouped(next)
    setOthers(otherRows)
    // 依赖 dataUpdatedAt 而非 data: React Query 结构共享会在内容不变时复用同一引用,
    // 只用 [data] 时「重新读取」到相同内容不会重跑本 effect, 表单便不会重置回服务器值。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUpdatedAt])

  function setKnownValue(cat: CategoryKey, key: string, value: FieldValue) {
    setGrouped((prev) => ({
      ...prev,
      [cat]: prev[cat].map((r) => (r.key === key ? { ...r, value } : r)),
    }))
  }
  function setOtherValue(key: string, value: string) {
    setOthers((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)))
  }

  function collectUpdates(): Record<string, string> {
    const updates: Record<string, string> = {}
    for (const cat of CATEGORIES) {
      for (const row of grouped[cat.key]) {
        if (row.meta.managed) continue
        let v = toIniValue(row.meta.type, row.value)
        if (row.meta.type === 'text' || row.meta.type === 'select') {
          v = `"${String(row.value).replace(/^"|"$/g, '')}"`
        }
        updates[row.key] = v
      }
    }
    for (const row of others) {
      const s = String(row.value)
      updates[row.key] =
        /[",]/.test(s) && !/^".*"$/.test(s) ? `"${s.replace(/"/g, '')}"` : s
    }
    return updates
  }

  async function handleSave() {
    await updateIni.mutateAsync(collectUpdates())
  }
  async function handleSaveAndRestart() {
    await updateIni.mutateAsync(collectUpdates())
    await serverAction.mutateAsync('restart')
  }

  const saving = updateIni.isPending || serverAction.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="服务器设置"
        description="编辑 PalWorldSettings.ini · 修改后需重启生效"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : ''} />
            重新读取
          </Button>
        }
      />

      <Alert>
        <Info />
        <AlertTitle>关于配置分类</AlertTitle>
        <AlertDescription>
          配置项按官方文档分为四类。带「由启动配置管理」的项由 game/server.env 在每次启动时写入，
          此处修改会在下次重启被覆盖，请到 server.env 修改。文档未收录的项归到「其它」页，原样编辑。
        </AlertDescription>
      </Alert>

      {isError ? (
        <Alert variant="destructive">
          <Info />
          <AlertTitle>读取失败</AlertTitle>
          <AlertDescription>
            {(error as Error)?.message ?? '无法读取配置文件，服务器可能尚未首次启动。'}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4 flex-wrap">
                {CATEGORIES.map((c) => (
                  <TabsTrigger key={c.key} value={c.key}>
                    {c.title}
                    <Badge variant="secondary" className="ml-1.5 font-mono">
                      {grouped[c.key].length}
                    </Badge>
                  </TabsTrigger>
                ))}
                {others.length > 0 ? (
                  <TabsTrigger value="others">
                    其它
                    <Badge variant="secondary" className="ml-1.5 font-mono">
                      {others.length}
                    </Badge>
                  </TabsTrigger>
                ) : null}
              </TabsList>

              {CATEGORIES.map((c) => (
                <TabsContent key={c.key} value={c.key} className="space-y-0">
                  <p className="mb-2 text-sm text-muted-foreground">{c.tip}</p>
                  {grouped[c.key].length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      该分类暂无配置项
                    </p>
                  ) : (
                    grouped[c.key].map((row) => (
                      <SettingsField
                        key={row.key}
                        fieldKey={row.key}
                        meta={row.meta}
                        value={row.value}
                        onChange={(v) => setKnownValue(c.key, row.key, v)}
                      />
                    ))
                  )}
                </TabsContent>
              ))}

              {others.length > 0 ? (
                <TabsContent value="others" className="space-y-0">
                  <p className="mb-2 text-sm text-muted-foreground">
                    文档未收录 / 新版本新增的配置项，原样以文本编辑。
                  </p>
                  {others.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-1 gap-2 border-b border-border/60 py-4 last:border-0 md:grid-cols-[minmax(0,320px)_1fr] md:items-center md:gap-6"
                    >
                      <Label htmlFor={`other-${row.key}`} className="font-mono text-xs">
                        {row.key}
                      </Label>
                      <Input
                        id={`other-${row.key}`}
                        className="max-w-sm"
                        value={row.value}
                        onChange={(e) => setOtherValue(row.key, e.target.value)}
                      />
                    </div>
                  ))}
                </TabsContent>
              ) : null}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-0 flex flex-wrap gap-3 border-t border-border bg-background/70 py-4 backdrop-blur-xl">
        <Button onClick={handleSave} disabled={saving || isLoading}>
          <Save />
          {updateIni.isPending && !serverAction.isPending ? '保存中…' : '保存配置'}
        </Button>
        <Button variant="warning" onClick={handleSaveAndRestart} disabled={saving || isLoading}>
          <RotateCw />
          保存并重启
        </Button>
      </div>
    </div>
  )
}
