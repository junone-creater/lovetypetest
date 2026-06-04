import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // 배포(gh-pages)는 junone-creater.github.io/lovetypetest/ 하위라 base 필요,
  // 로컬 dev 서버는 루트('/')로 둬서 localhost 접속 편하게
  base: command === 'build' ? '/lovetypetest/' : '/',
  server: {
    host: true,  // 같은 와이파이의 폰 등에서 접속 가능 (네트워크 주소 노출)
  },
}))
