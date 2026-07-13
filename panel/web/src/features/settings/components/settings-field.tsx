'use client'

/**
 * 单个配置项行: 标签 + 控件 + 说明。
 * - 控件按 type 分派 (bool→Switch, select→Select, int/float→number Input, text→Input)。
 * - managed 项只读并标注「由启动配置管理」。
 * - note 以危险色小徽章 + Tooltip 呈现。
 */
import { Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { FieldMeta, FieldValue } from '../settings-schema'

interface SettingsFieldProps {
  fieldKey: string
  meta: FieldMeta
  value: FieldValue
  onChange: (value: FieldValue) => void
}

export function SettingsField({ fieldKey, meta, value, onChange }: SettingsFieldProps) {
  const disabled = !!meta.managed

  return (
    <div className="grid grid-cols-1 gap-2 border-b border-border/60 py-4 last:border-0 md:grid-cols-[minmax(0,320px)_1fr] md:items-start md:gap-6">
      {/* 标签列 */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Label htmlFor={fieldKey} className="text-sm font-medium">
            {meta.label}
          </Label>
          {meta.note ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex cursor-help text-warning">
                  <Info className="size-3.5" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{meta.note}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <code className="block font-mono text-xs text-muted-foreground/70">{fieldKey}</code>
      </div>

      {/* 控件 + 说明列 */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {meta.type === 'bool' ? (
            <Switch
              id={fieldKey}
              checked={value as boolean}
              disabled={disabled}
              onCheckedChange={(v) => onChange(v)}
            />
          ) : meta.type === 'select' ? (
            <Select
              value={String(value)}
              disabled={disabled}
              onValueChange={(v) => onChange(v)}
            >
              <SelectTrigger id={fieldKey} className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meta.options?.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : meta.type === 'int' || meta.type === 'float' ? (
            <Input
              id={fieldKey}
              type="number"
              inputMode="decimal"
              step={meta.type === 'float' ? '0.1' : '1'}
              className="w-48 font-mono"
              value={value === '' ? '' : String(value)}
              disabled={disabled}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === '') return onChange('')
                const n = Number(raw)
                onChange(Number.isNaN(n) ? raw : n)
              }}
            />
          ) : (
            <Input
              id={fieldKey}
              className="max-w-sm"
              value={value as string}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
            />
          )}

          {meta.managed ? (
            <Badge variant="secondary" className="font-normal">
              由启动配置管理
            </Badge>
          ) : null}
        </div>
        {meta.desc ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{meta.desc}</p>
        ) : null}
      </div>
    </div>
  )
}
