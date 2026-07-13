import type { NextConfig } from 'next'

// 后端 (FastAPI) 地址: 开发时用于代理 /api, 生产同源由 FastAPI 托管静态导出产物。
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:8000'

const nextConfig: NextConfig = {
  // 静态导出: 产物为纯静态站点, 由 FastAPI 的 StaticFiles + SPA fallback 托管,
  // 与原 Vue 架构一致, 生产环境无需额外 Node 进程。
  output: 'export',
  images: { unoptimized: true },
  // 开发环境把 /api 代理到后端 (静态导出模式下 rewrites 仅在 next dev 生效)。
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${API_TARGET}/api/:path*` }]
  },
}

export default nextConfig
