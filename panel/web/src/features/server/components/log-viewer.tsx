'use client'

/**
 * 容器日志高亮渲染。
 *
 * 日志区背景在明暗两个主题下都是深色 (--code-bg), 因此这里用一套固定的
 * 终端风配色 (不跟随主题), 保证对比度稳定。按常用规则着色:
 *  - 日志级别: FATAL/ERROR (红) / WARN (黄) / INFO/LOG (青) / DEBUG/TRACE (灰)
 *  - 时间戳: [.. .. ..] 或 ISO, 弱化为灰
 *  - IP:端口 / URL: 高亮
 *  - 引号字符串: 暖色
 *  - 数字: 轻微强调
 * 整行按级别定一个基调, 再在行内对时间戳/IP/字符串等做局部高亮。
 */
import * as React from 'react'
import { cn } from '@/lib/utils'

type Level = 'error' | 'warn' | 'info' | 'debug' | 'plain'

/** 行级别的基调色 (整行文字默认色)。 */
const LEVEL_LINE: Record<Level, string> = {
  error: 'text-[#ff6b6b]',
  warn: 'text-[#ffd166]',
  info: 'text-[#8bd5ff]',
  debug: 'text-[#7d8590]',
  plain: 'text-[#c9d1d9]',
}

/** 级别徽记文字色 (加粗)。 */
const LEVEL_BADGE: Record<Exclude<Level, 'plain'>, string> = {
  error: 'text-[#ff8787] font-semibold',
  warn: 'text-[#ffdf8a] font-semibold',
  info: 'text-[#a5ddff] font-semibold',
  debug: 'text-[#8b949e] font-semibold',
}

const LEVEL_RE = /\b(FATAL|ERROR|ERR|WARN(?:ING)?|INFO|LOG|NOTICE|DEBUG|TRACE|VERBOSE)\b/i

function levelOf(line: string): Level {
  const m = line.match(LEVEL_RE)
  if (!m) {
    // 无显式级别时, 靠常见错误词兜底
    if (/\b(error|failed|failure|exception|panic|fatal|crash)\b/i.test(line)) return 'error'
    if (/\b(warn|warning|deprecated)\b/i.test(line)) return 'warn'
    return 'plain'
  }
  const kw = (m[1] ?? '').toUpperCase()
  if (kw === 'FATAL' || kw === 'ERROR' || kw === 'ERR') return 'error'
  if (kw.startsWith('WARN')) return 'warn'
  if (kw === 'DEBUG' || kw === 'TRACE' || kw === 'VERBOSE') return 'debug'
  return 'info'
}

/**
 * 行内分段高亮。用一个组合正则一次性切出各类 token, 其余按原文输出。
 * 顺序: 时间戳 -> IP:端口 -> URL -> 引号字符串 -> 独立数字。
 */
const TOKEN_RE = new RegExp(
  [
    '(?<ts>\\[[^\\]]*?\\d[^\\]]*?\\]|\\d{4}[-.\\/]\\d{2}[-.\\/]\\d{2}[ T]\\d{2}:\\d{2}:\\d{2}(?:[.,]\\d+)?)', // 时间戳
    '(?<ip>\\b\\d{1,3}(?:\\.\\d{1,3}){3}(?::\\d{1,5})?\\b)', // IP(:端口)
    '(?<url>https?:\\/\\/[^\\s]+)', // URL
    "(?<str>\"[^\"]*\"|'[^']*')", // 引号字符串
    '(?<num>\\b\\d+(?:\\.\\d+)?\\b)', // 数字
  ].join('|'),
  'gi',
)

interface Piece {
  key: string
  cls?: string
  text: string
}

function highlightInline(line: string, base: Level): Piece[] {
  const pieces: Piece[] = []
  let last = 0
  let i = 0
  for (const m of line.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0
    if (idx > last) pieces.push({ key: `t${i++}`, text: line.slice(last, idx) })
    const g = m.groups ?? {}
    let cls: string | undefined
    if (g.ts) cls = 'text-[#6b7280]'
    else if (g.ip) cls = 'text-[#c39bff]'
    else if (g.url) cls = 'text-[#7ee0c4] underline decoration-dotted underline-offset-2'
    else if (g.str) cls = 'text-[#f0a878]'
    else if (g.num) cls = base === 'plain' ? 'text-[#9fd3a8]' : undefined
    pieces.push({ key: `m${i++}`, cls, text: m[0] })
    last = idx + m[0].length
  }
  if (last < line.length) pieces.push({ key: `t${i++}`, text: line.slice(last) })
  return pieces
}

function LogLine({ line }: { line: string }) {
  const level = levelOf(line)
  const pieces = highlightInline(line, level)
  return (
    <div className={cn('whitespace-pre-wrap break-words', LEVEL_LINE[level])}>
      {pieces.map((p) => {
        // 级别关键词单独加粗上色 (仅在有显式级别时)
        if (level !== 'plain' && !p.cls && LEVEL_RE.test(p.text)) {
          const parts = p.text.split(LEVEL_RE)
          return (
            <React.Fragment key={p.key}>
              {parts.map((part, j) =>
                LEVEL_RE.test(part) ? (
                  <span key={j} className={LEVEL_BADGE[level]}>
                    {part}
                  </span>
                ) : (
                  <React.Fragment key={j}>{part}</React.Fragment>
                ),
              )}
            </React.Fragment>
          )
        }
        return p.cls ? (
          <span key={p.key} className={p.cls}>
            {p.text}
          </span>
        ) : (
          <React.Fragment key={p.key}>{p.text}</React.Fragment>
        )
      })}
    </div>
  )
}

interface LogViewerProps {
  text: string | undefined
  className?: string
  emptyText?: string
}

export const LogViewer = React.forwardRef<HTMLDivElement, LogViewerProps>(
  function LogViewer({ text, className, emptyText = '暂无日志' }, ref) {
    const lines = React.useMemo(() => (text ? text.split('\n') : []), [text])
    return (
      <div
        ref={ref}
        className={cn(
          'overflow-auto rounded-md bg-code-bg p-3 font-mono text-xs leading-relaxed text-code-fg',
          className,
        )}
      >
        {lines.length === 0 ? (
          <span className="text-muted-foreground">{emptyText}</span>
        ) : (
          lines.map((line, i) => <LogLine key={i} line={line} />)
        )}
      </div>
    )
  },
)
