import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

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
      'https://www.aeknow.org/': {
        target: 'https://www.aeknow.org/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/szapi/, ''),
      },
    },
  },
})
