import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'
const apiTarget = process.env.VITE_API_BASE_URL || 'http://139.224.135.232:9000'
// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 52101,
    proxy: {
      '/api': {
        target: apiTarget, // 使用环境变量
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        // 可选：配置更多代理选项
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url)
          })
        }
      }
    }
  },
  // 定义全局常量
  define: {
    __API_BASE_URL__: JSON.stringify(apiTarget)
  }
})
