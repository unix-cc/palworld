# 前端开发规范 (幻兽帕鲁面板 · web)

本文件为 Claude Code 在本目录 (`panel/web`) 下编写前端代码时的**强制参考**。
新增页面 / 组件 / 功能时，务必遵循以下约束，保证视觉、交互、代码风格一致。

> 本项目历史上出现过「文件漂移」(同一文件被写了多个版本)。**以磁盘为准**：
> 改动后运行 `npx tsc --noEmit` 一次性校验全部类型，再 `npm run build` 确认静态导出。

---

## 1. 技术栈 (不要引入多余依赖)

- **Next.js 16** (App Router, `output: 'export'` 静态导出) · **React 19** · **TypeScript strict**
- **Tailwind CSS v4** (无 `tailwind.config`，token 定义在 `globals.css` 的 `@theme inline`)
- **shadcn/ui 风格** 组件 (new-york) 建立在 **Radix UI** 之上
- **TanStack Query** (数据) · **TanStack Table** (表格)
- **React Hook Form + Zod** (表单/校验)
- **Zustand** (轻量全局态，如 auth) · **next-themes** (主题) · **lucide-react** (图标) · **sonner** (toast)

需要新依赖前先确认现有栈无法满足。图标只用 **lucide-react**，不要用 emoji 当图标。

---

## 2. 设计语言 (约束的核心)

风格取向：**Linear 暗色致密**控制台 (兼顾 Vercel/Stripe 的克制)。近黑带蓝的 canvas、
分层表面 (canvas < card < elevated)、发丝级 1px 边框、单一靛紫强调、语义色降饱和仅用于状态。
默认深色主题；正文 13-14px、字距收紧 (`tracking-tight` 常态化)。

| 语义 | 颜色 | 用途 |
|---|---|---|
| **Primary (Indigo)** | `primary` | 主 CTA、激活态、焦点环、链接 |
| **Success (Emerald)** | `success` | 运行中 / 健康 / 成功状态 |
| **Warning (Amber)** | `warning` | 重启 / 警示 |
| **Destructive (Red)** | `destructive` | 停止 / 删除 / 封禁 |

- 正文字体 **Geist**；数字 / ID / 代码 / 日志用 **Geist Mono** (等宽)——加 `tabular` 类。
  字体走 `next/font` 自托管 (`geist` 包，注入 `--font-geist-sans/mono`)，**无 CDN 依赖**，不要再加 Google Fonts `<link>`。
- 卡片圆角 `rounded-xl` (基准 `--radius` 8px)，发丝级边框 `border-border`，极淡投影 + 顶部 1px 高光 (`surface-highlight`)。
- 尺寸偏致密：Button 默认 `h-8`、`sm` `h-7`、`lg` `h-9`；Input/Select `h-8`；正文 `text-[13px]`。
- 动效克制 (150ms)，且必须尊重 `prefers-reduced-motion` (全局已处理)。
- **⌘K 命令面板**：全局挂载于 dashboard layout，`⌘K/Ctrl+K` 或 header 搜索按钮唤起；含页面跳转 + 服务器快捷操作 + 主题/退出。新增全局操作时在 `components/shared/command-palette.tsx` 补项。

---

## 3. 头号规则：只用语义 token，禁止硬编码颜色

所有颜色**必须**走语义 token 类，让明/暗主题自动生效。token 在 `src/app/globals.css`
中成对定义 (`:root` = 浅色 / `.dark` = 深色)，并通过 `@theme inline` 暴露为 Tailwind 工具类。

```tsx
// ✅ 正确 —— token 类，自动适配 light/dark
<div className="bg-card text-card-foreground border-border rounded-lg">
<span className="text-muted-foreground">次要文字</span>
<span className="text-success">运行中</span>
<Button className="bg-primary text-primary-foreground">

// ❌ 错误 —— 硬编码，破坏暗色模式与一致性
<div className="bg-white text-slate-900 border-gray-200">
<div style={{ color: '#4F46E5' }}>
```

**永远不要**：`bg-white` / `text-gray-*` / `text-slate-*` / 原始 hex / 内联 `style` 写颜色 /
自己写 `dark:` 变体 (token 已经帮你处理暗色)。

### 可用 token 类

- **表面 (分层: canvas < card < elevated)**：`bg-background` `bg-card` `bg-elevated` `bg-popover` `bg-muted` `bg-secondary` `bg-sidebar` `bg-accent` `bg-sidebar-accent`
- **文字**：`text-foreground` `text-muted-foreground`，以及每个表面对应的 `-foreground`
- **品牌/语义**：`primary` `success` `warning` `destructive` `accent`——可作 `bg-*` / `text-*` / `border-*`，支持透明度 `bg-primary/10` `border-success/40`
- **线条/焦点**：`border-border` (常态发丝级) `border-border-strong` (hover/强调) `border-input` `ring-ring`
- **顶部高光**：`.surface-highlight` 类给卡片/浮层上缘加 1px 渐变高光 (Linear 招牌)；或直接用 `--highlight` token
- **代码/日志区**：`bg-code-bg` `text-code-fg`
- **图表**：`chart-1` … `chart-5` (色盲友好，非纯红/绿对)
- **圆角**：`rounded-sm/md/lg/xl/2xl` (基准 8px，卡片用 `xl`)
- **等宽数字**：任何数字/ID 单元格加 `tabular` 类 (Geist Mono + tabular-nums)

### 新增 token 时 (三处都要改，否则工具类不生效)

1. `globals.css` 的 `:root` 加浅色值
2. `globals.css` 的 `.dark` 加深色值
3. `@theme inline` 加 `--color-<name>: var(--<name>);`

---

## 4. 目录结构 (feature-first)

```
src/
  app/
    (dashboard)/<page>/page.tsx   # 受保护页面 (在 layout 内经 AuthGuard)
    login/page.tsx                # 登录页
    layout.tsx                    # 根 layout (Providers 挂载处)
    globals.css                   # ★ 设计 token 单一真源
  components/
    ui/                           # shadcn/Radix 基础组件 (button/card/...)
    shared/                       # 业务级共享组件 (PageHeader/StatCard/...)
    layout/                       # 外壳 (sidebar/header/auth-guard/nav)
    providers/                    # QueryProvider / ThemeProvider
  features/<feature>/
    services/<feature>-service.ts # 只放 axios 调用，返回类型化数据
    hooks/use-<feature>.ts        # useQuery / useMutation 封装
    components/                   # 该功能专属组件 (如 players-table)
  lib/
    api.ts                        # axios 实例 + tokenStorage + apiError()
    query-keys.ts                 # ★ 集中式 query key 工厂
    utils.ts                      # cn() 类名合并
  stores/                         # Zustand (auth-store 等)
  types/api.ts                    # 后端契约类型
```

---

## 5. 新增一个页面的标准流程

1. **路由**：建 `src/app/(dashboard)/<name>/page.tsx`，`'use client'` 开头。
2. **导航**：在 `src/components/layout/sidebar-nav.ts` 的 `navItems` 加一项 (含 lucide 图标)。
3. **数据**：在 `features/<name>/services` 写 axios 调用，`features/<name>/hooks` 用 TanStack Query 封装。**禁止**在组件里直接调 axios/fetch。
4. **页面骨架**用共享组件拼装：

```tsx
'use client'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function XxxPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="标题" description="一句话说明" actions={<Button>主操作</Button>} />
      <Card>
        <CardHeader><CardTitle>区块标题</CardTitle></CardHeader>
        <CardContent>{/* ... */}</CardContent>
      </Card>
    </div>
  )
}
```

页面根容器统一用 `space-y-6`；页面内间距走 4/8 体系 (`gap-2/3/4/6`、`p-4/5/6`)。

---

## 6. 数据层规范 (TanStack Query)

- **service** 只负责 HTTP，返回类型化结果；错误交给上层。
- **hook** 用 `queryKeys` (来自 `@/lib/query-keys`) 取 key，**不要**散写字符串数组。
- 变更成功后用 `queryClient.invalidateQueries({ queryKey: queryKeys.xxx })` 失效相关查询。
- 错误提示统一 `toast.error(apiError(err, '兜底文案'))`——`apiError` 来自 `@/lib/api`，会提取后端 `detail`。
- 轮询用 `refetchInterval`；需要「转换/解包」响应时用 `select` (例：`usePlayers` 用 `select` 把 `{players}` 解包成 `Player[]`，则页面里 `data` 已是数组，不要再 `data.players`)。

```ts
// hook 范例
export function useThings(pollMs = 10000) {
  return useQuery({
    queryKey: queryKeys.things,
    queryFn: fetchThings,
    refetchInterval: pollMs,
  })
}
export function useDeleteThing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteThing(id),
    onSuccess: () => {
      toast.success('已删除')
      qc.invalidateQueries({ queryKey: queryKeys.things })
    },
    onError: (err) => toast.error(apiError(err, '删除失败')),
  })
}
```

新增 query key 时在 `src/lib/query-keys.ts` 里补，不要在别处硬写。

---

## 7. 表单规范 (React Hook Form + Zod)

- schema 用 **Zod**；数字字段用 `z.number()` + `register('x', { valueAsNumber: true })`。
  **不要**用 `z.coerce.number()` (Zod 4 下 input 类型为 `unknown`，与 resolver 冲突)。
- 每个输入有可见 `<Label htmlFor>`；错误就近显示，用 `text-destructive` + `role="alert"`。
- 提交按钮在 pending 时 `disabled` 并给 loading 文案。

---

## 8. 现成可复用组件 (优先复用，不要重造)

**`components/ui/` 基础组件**：button, card, input, textarea, label, badge, table, dialog,
alert-dialog, dropdown-menu, tooltip, select, switch, tabs, sonner, alert, progress,
separator, popover, skeleton, **command** (cmdk 套壳, ⌘K 面板用)。

**`Button` variants**：`default`(indigo) `destructive` `success` `warning` `outline` `secondary` `ghost` `link`；
sizes：`default`(h-8) `sm`(h-7) `lg`(h-9) `icon`(8×8)。表面按钮 (primary/语义) 自带顶部 1px 高光内阴影。

**`Badge` variants**：`default` `secondary` `success` `warning` `danger` `muted` `outline`。

**`components/shared/` 业务组件**：

| 组件 | 关键 props | 用途 |
|---|---|---|
| `PageHeader` | `title` `description?` `actions?` | 页面顶部标题区 |
| `StatCard` | `label` `value` `icon?` `sub?` `tone?` `accent?` | KPI 数值卡 (tone: default/success/warning/destructive/muted) |
| `StatusIndicator` | `tone` `label` `pulse?` | 状态灯 (tone: running/stopped/pending/unknown)；色+文字双通道 |
| `EmptyState` | `icon?` `title` `description?` `action?` | 表格/列表空态 |
| `ConfirmDialog` | `trigger` `title` `description?` `confirmText?` `destructive?` `onConfirm` | 破坏性操作二次确认；`onConfirm` 可返回 Promise |

破坏性操作 (删除/停止/封禁/恢复) **必须**用 `ConfirmDialog` 且 `destructive`。

---

## 9. 无障碍 & 交互 (硬性)

- 焦点可见：交互元素保留焦点环 (全局 `outline-ring/50` 已配)，不要移除。
- 不能只靠颜色传达信息——配图标或文字 (参考 `StatusIndicator` / 任务类型徽章)。
- 图标按钮必须有 `aria-label`。
- 可点击元素用语义标签 (`<button>`/`<a>`)，触达区 ≥ 舒适尺寸。
- 表格：粘性表头、hover 高亮、排序指示、空态、加载用 `Skeleton`。

---

## 10. 主题机制小抄

- 明/暗由 `<html>` 的 `.dark` 类切换 (next-themes 管理，默认 dark)。
- 想整体换主色：改 `globals.css` 里 `--primary` 的 `:root` 与 `.dark` 两处即可，全站跟随。
- **绝不**在组件里写死颜色来「临时」达成效果——一定回到 token。

---

## 11. 收尾自检 (每次改动后)

1. `npx tsc --noEmit` —— 一次性全量类型检查 (比逐个 build 快，能抓全部漂移)。
2. `npm run build` —— 确认静态导出通过 (9 条路由)。
3. 自查：无硬编码颜色 / 无组件内直接 axios / query key 走工厂 / 破坏性操作有确认框 /
   新 token 三处齐全 / 图标有 aria-label。
