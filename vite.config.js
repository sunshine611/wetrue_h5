import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  base: './',
  resolve: {
    alias: {
      '@': '/src',
    }
  },
  // 反向代理
  server: {
    port: 8080, //本地端口
    fs: {
      strict: false, //  支持引用除入口目录的文件
    },
    // open: true, // 是否自动在浏览器打开
    proxy: {
      '/szapi': {
        target: 'https://tradesz.test.api.qywgpo.com/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/szapi/, ''),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1500,
    emptyOutDir: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
        chunkFileNames: () => {
          return `js/[name].[hash].js`;
        }
      }
    }
  },
})
