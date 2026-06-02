import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: true,  // 같은 와이파이의 폰 등에서 접속 가능 (네트워크 주소 노출)
  },
})
