import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 커스텀 도메인(love-type-test.ieumnaru.co.kr) 루트에서 서빙되므로 base는 '/'
  base: '/',
  server: {
    host: true,  // 같은 와이파이의 폰 등에서 접속 가능 (네트워크 주소 노출)
  },
})
