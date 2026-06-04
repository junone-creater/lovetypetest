  // ─────────────────────────────────────────────────────────
  // 이음나루 랜딩페이지 신청 폼 → Google Sheets 저장
  //
  // [배포 방법]
  // 1. Google Sheets 새 파일 생성 → 시트 이름 "신청자" 로 변경
  // 2. 상단 메뉴 → 확장 프로그램 → Apps Script
  // 3. 아래 코드 전체 붙여넣기 (기존 내용 삭제 후)
  // 4. 저장(Ctrl+S) → 배포 → 새 배포
  // 5. 종류: 웹 앱 / 실행 계정: 나 / 액세스: 모든 사용자
  // 6. 배포 → 웹 앱 URL 복사 (…/exec 로 끝나는 주소)
  // 7. 복사한 전체 URL을 아래 두 파일의 SHEET_URL 상수에 붙여넣기
  //    - src/pages/ApplyPage.jsx
  //    - src/pages/LandingPage.jsx  (신청자 수 카운터용)
  // ─────────────────────────────────────────────────────────

  function doPost(e) {
    return handle(e);
  }

  function doGet(e) {
    return handle(e);
  }

  function handle(e) {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet()
                      .getSheetByName("신청자") ||
                    SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

      const d = e.parameter;

      // ── 신청자 수 카운트 요청 (랜딩 카운터용 JSONP) ──
      if (d.action === "count") {
        const count = Math.max(0, sheet.getLastRow() - 1); // 헤더 제외
        const body = JSON.stringify({ count: count });
        // callback 파라미터가 있으면 JSONP로 응답
        if (d.callback) {
          return ContentService
            .createTextOutput(d.callback + "(" + body + ")")
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
        return ContentService
          .createTextOutput(body)
          .setMimeType(ContentService.MimeType.JSON);
      }

      // 헤더가 없으면 첫 행에 추가
      if (sheet.getLastRow() === 0) {
        sheet.appendRow([
          "신청일시", "이름", "성별", "연애유형",
          "연락처", "나이", "직업", "거주지",
          "희망시간", "상담내용", "유입경로"
        ]);
      }

      sheet.appendRow([
        new Date(),
        d.name     || "",
        d.gender   || "",
        d.type     || "",
        d.phone    || "",
        d.age      || "",
        d.job      || "",
        d.location || "",
        d.calltime || "",
        d.concern  || "",
        d.source   || ""
      ]);

      return ContentService
        .createTextOutput(JSON.stringify({ status: "ok" }))
        .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", msg: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
