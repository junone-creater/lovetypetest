import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 신청자 수: 빌드(배포) 시점에 구글 시트에서 실제 count를 미리 받아와 코드에 박아둠.
// → 접속 첫 화면부터 숫자를 들고 있어 지연/레이아웃 점프 없음 (이후 런타임 JSONP로 실시간 갱신).
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'
async function fetchBuildCount() {
  try {
    const res = await fetch(`${SHEET_URL}?action=count`, { signal: AbortSignal.timeout(10000) })
    const json = await res.json()
    if (typeof json.count === 'number' && json.count >= 0) return json.count
  } catch (e) {
    console.warn('[build] 신청자 수 사전 로드 실패, 0으로 대체:', e.message)
  }
  return 0  // 실패 시 0 → 런타임에서 JSONP/캐시가 채움
}

export default defineConfig(async ({ command }) => {
  const buildCount = command === 'build' ? await fetchBuildCount() : 0
  if (command === 'build') console.log(`[build] 신청자 수 사전 주입: ${buildCount}`)
  return {
    plugins: [react()],
    // 커스텀 도메인(love-type-test.ieumnaru.co.kr) 루트에서 서빙되므로 base는 '/'
    base: '/',
    define: { __BUILD_APPLICANT_COUNT__: buildCount },
    server: {
      host: true,  // 같은 와이파이의 폰 등에서 접속 가능 (네트워크 주소 노출)
    },
  }
})
