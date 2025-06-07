import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    // 添加 Buffer 的全局定义
    'Buffer': ['buffer', 'Buffer'],
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util',
      // 修改 buffer 的处理方式
      buffer: 'buffer',
      events: 'events',
      eventemitter3: 'eventemitter3'
    }
  },
  optimizeDeps: {
    include: ['process', 'buffer', 'eventemitter3', 'events'],
    exclude: []
  },
  // 添加这个配置来处理 Node.js polyfills
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {
          buffer: 'Buffer'
        }
      }
    }
  }
})