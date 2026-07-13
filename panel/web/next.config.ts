import type { NextConfig } from 'next'

// 后端 (FastAPI) 地址: 开发时用于代理 /api, 生产同源由 FastAPI 托管静态导出产物。
const API_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:8000'

// next dev 时 NODE_ENV=development, next build 时为 production。
const isDev = process.env.NODE_ENV === 'development'

// output:'export' 与 rewrites 不兼容 (会告警 export-no-custom-routes)。
// 二者本就互斥用途: rewrites 仅在 next dev 代理 /api 用; 生产走静态导出,
// /api 由托管产物的 FastAPI 同源提供, 无需 rewrites。故按环境二选一。
const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isDev
    ? {
        // 开发: 把 /api 代理到后端 FastAPI。
        async rewrites() {
          return [{ source: '/api/:path*', destination: `${API_TARGET}/api/:path*` }]
        },
      }
    : {
        // 生产: 静态导出为纯静态站点, 由 FastAPI 的 StaticFiles + SPA fallback 托管,
        // 生产环境无需额外 Node 进程。
        output: 'export',
      }),
}

export default nextConfig
