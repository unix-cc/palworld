/** 侧栏导航配置。单一数据源, sidebar 与 header 面包屑共用。 */
import {
  LayoutDashboard,
  Users,
  Radio,
  Settings2,
  Archive,
  CalendarClock,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** 页面标题 (header 显示, 可与 label 不同) */
  title?: string
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { href: '/players', label: '玩家管理', icon: Users },
  { href: '/console', label: '广播 / 控制', icon: Radio },
  { href: '/settings', label: '服务器设置', icon: Settings2 },
  { href: '/backups', label: '存档备份', icon: Archive },
  { href: '/tasks', label: '计划任务', icon: CalendarClock },
]

/** 由路径找到当前导航项 (用于标题/高亮)。 */
export function findNav(pathname: string): NavItem | undefined {
  return navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))
}
