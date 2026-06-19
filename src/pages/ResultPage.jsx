import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TYPES } from '../constants/types'
import { FONT } from '../constants/tokens'
import { RESULT_STORY, UNAIT } from '../constants/character'
import { store } from '../store'

const PURPLE = '#9B5DE5'
const LILAC = '#C084FC'
const HERO = `${import.meta.env.BASE_URL}images/intro-hero.png`

// 신청 접수 시트 (ApplyPage와 동일) — 폼 대신 채팅으로 받아 여기로 전송
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyjqcPPG9Xh5eIYNng0W29NscxfKR1JzcBsB0mIM9F9vGsH6It3YIHmu0lIGJMS/exec'

function fmtPhone(v) {
  const n = v.replace(/[^0-9]/g, '').slice(0, 11)
  if (n.length < 4) return n
  if (n.length < 8) return `${n.slice(0, 3)}-${n.slice(3)}`
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`
}

// 재확인 시 정보를 다시 받는 단계 (이름·나이·성별)
const EDIT_STEPS = [
  { key: 'name', target: 'user', type: 'text', ask: ['그럼 다시 알려줘. 이름이 어떻게 돼?'], placeholder: '이름' },
  { key: 'age', target: 'user', type: 'tel', ask: ['나이는 몇 살이야?'], placeholder: '예) 24' },
  { key: 'gender', target: 'user', type: 'chips', ask: ['성별도 알려줄 수 있어?'], options: ['여자', '남자'] },
]

// 대화로 받는 신청 단계
const APPLY_STEPS = [
  { key: 'phone', type: 'tel',
    ask: ['연락받을 번호 하나만 남겨줄 수 있어?'],
    placeholder: '010-0000-0000' },
  { key: 'job', type: 'chips',
    ask: ['고마워 :) 지금 어떻게 지내고 있어?'],
    options: ['대학생', '직장인', '취준생', '프리랜서', '기타'] },
  { key: 'location', type: 'text',
    ask: ['어디 살아? 지점 안내할 때 필요하거든.'],
    placeholder: '예) 서울 마포구' },
  { key: 'calltime', type: 'chips',
    ask: ['연락받기 편한 시간대가 언제야?'],
    options: ['평일 오전 (10~12시)', '평일 오후 (13~18시)', '평일 저녁 (18~19시)', '주말 (예약제)'] },
  { key: 'concern', type: 'text',
    ask: ['마지막으로 하나만 더.', '연애에서 요즘 제일 고민인 게 뭐야? 편하게 적어줘.'],
    placeholder: '편하게 적어줘' },
  { key: 'source', type: 'chips',
    ask: ['참, 나 어떻게 알고 왔어?'],
    options: ['인스타', '카카오톡', '친구·지인', '블로그'] },
]

const REVIEWS = [
  { name: '박지윤 (25)', text: '진짜 소름 돋았어요…ㅠㅠ 저 원래 이런 거 잘 안 믿는데 결과 딱 보는 순간 "이거 나잖아" 했거든요. 친구한테 바로 보냈더니 친구도 "너 완전 이거다"라고 ㅋㅋㅋ 신기해서 주변에 다 돌렸어요.' },
  { name: '최준혁 (27)', text: '남자라서 연애 테스트 같은 거 별로 안 좋아하는데 심심해서 해봤거든요. 근데 생각보다 진지하게 읽게 됐어요. 제가 왜 연락을 먼저 안 하게 되는지 딱 나와있는데 살짝 찔렸습니다 ㅋㅋ' },
  { name: '한소희 (23)', text: '결과 읽다가 중간에 멈췄어요. 너무 맞아서 좀 무서웠거든요ㅋㅋㅋ 특히 약점 부분이 제 전 연애 얘기 같아서… 친구랑 같이 하면서 서로 결과 보여줬는데 얘기가 엄청 길어졌어요.' },
  { name: '정도현 (28)', text: '처음엔 가볍게 했는데 결과 보고 나서 혼자 꽤 오래 생각했어요. 제 연애 패턴이 이렇게 딱 정리되는 게 신기했고, 읽으면서 "아 맞아 나 이랬지" 하는 순간이 계속 나왔어요.' },
  { name: '김민지 (22)', text: '친구가 보내줘서 했는데 이거 진짜 잘 맞아요. 제가 좋아하는 사람 생기면 연락 패턴 분석하는 버릇 있거든요ㅠ 결과에 그게 딱 나와있어서 너무 창피했어요 ㅋㅋ' },
  { name: '이준혁 (26)', text: '별 기대 없이 했는데 생각보다 깊이 있어서 놀랐어요. 제 연애에서 반복되는 패턴이 딱 설명이 되더라구요. 이게 왜 그런지는 몰랐는데 읽고 나서 좀 이해됐어요.' },
  { name: '이수연 (24)', text: '오빠한테 이거 해보라고 했더니 "내가 왜?" 하더니 결과 보고 나서 "ㅋㅋ 맞네" 함 ㅋㅋㅋ 커플이 같이 하면 서로 이해가 더 되는 것 같아요.' },
  { name: '박성훈 (29)', text: '연애 테스트 이런 거 원래 안 믿는 편인데 이건 좀 다르더라구요. 말투가 편해서 읽기 좋고, 결과도 적당히 찔리는 수준으로 나와서 ㅋㅋ 기분 나쁘지 않았어요.' },
  { name: '최유나 (21)', text: '인트로부터 유라 말투가 너무 현실적이라서 진짜 누군가랑 대화하는 느낌이었어요. 결과도 맞고 뭔가 위로받은 기분? 연애하다 힘들 때 다시 읽어봐야겠어요.' },
  { name: '윤재원 (25)', text: '여자친구가 해보라고 해서 했는데 결과 보여줬더니 "너 완전 이거잖아" 라고 ㅋㅋㅋ 사귀면서도 몰랐던 부분을 테스트가 먼저 짚어줬어요.' },
  { name: '정소이 (26)', text: '몇 가지 질문인데 이렇게 정확하게 나오는 게 신기해요. 제가 싸우면 잠수 타는 스타일인데 그게 결과에 나왔을 때 진짜 뜨끔했거든요ㅋㅋ' },
  { name: '오민석 (23)', text: '결과 타입 이름이 재밌어요. 제가 어떤 타입인지 친구한테 설명하기 되게 편해졌어요. "나 이 타입이야" 하면 바로 이해하더라구요 ㅋㅋ' },
  { name: '강예진 (22)', text: '중간에 유라 반응이 너무 공감돼서 혼자 "맞아맞아" 하면서 했어요ㅋㅋ 결과도 정확하고 분위기가 좋아서 지루하지 않았어요.' },
  { name: '임형준 (28)', text: '제 연애 스타일이 이렇게 분류될 수 있다는 게 흥미롭더라구요. 결과 보고 나서 왜 전 연애가 그렇게 흘러갔는지 조금 이해됐어요.' },
  { name: '홍아름 (24)', text: '읽으면서 "이거 나 아니야?" 하는 문장이 세 개 이상 나왔어요ㅠㅠ 특히 상대 접속 시간 확인하는 부분은 진짜 저 얘기예요…' },
  { name: '배성재 (27)', text: '남자들은 이런 거 안 한다는 편견 깨졌어요. 주변 친구들이 다 해보자고 해서 같이 했는데 결과 비교하는 게 은근 재밌었어요 ㅋㅋ' },
  { name: '신채원 (23)', text: '썸 타는 사람한테 해보라고 보냈더니 서로 결과 보여주면서 얘기 엄청 나눴어요. 오히려 연락할 핑곗거리 생겨서 좋았어요ㅋㅋ' },
  { name: '강도윤 (26)', text: '결과 읽다가 조언 파트에서 "이거 나한테 하는 말인가?" 싶었어요. 딱 제가 고쳐야 할 부분을 짚어줘서 불편한데 맞는 느낌이었어요.' },
  { name: '류하린 (22)', text: '분위기가 너무 좋아요. 어떤 테스트는 결과가 너무 딱딱한데 이건 읽으면서 기분이 좋더라구요. 결과도 잘 맞고 추천하고 싶어요.' },
  { name: '홍준서 (24)', text: '10문제인데 이렇게 깊이 나오는 게 신기해요. 문항 수 대비 결과가 엄청 구체적이더라구요. 읽는 데 시간이 꽤 걸렸어요 ㅋㅋ' },
  { name: '문지수 (25)', text: '약점 파트 읽다가 살짝 찔려서 화면 덮었다가 다시 폈어요ㅋㅋㅋ 근데 맞는 말이라 인정하게 됐어요. 보고 나서 생각이 많아졌어요.' },
  { name: '신태양 (28)', text: '처음엔 가볍게 시작했는데 끝나고 보니 진지하게 읽고 있었어요ㅋㅋ 연애 스타일이 이렇게 패턴화된다는 게 재밌는 관점인 것 같아요.' },
  { name: '조은서 (21)', text: '엄마한테도 보여줬더니 "어머 이거 엄마 얘기네" 하셨어요ㅋㅋㅋ 세대 상관없이 공감되는 부분이 있나봐요. 가족이랑 같이 해봤어요.' },
  { name: '류건우 (25)', text: '결과 유형 이름이 기억에 남아요. 친구한테 "나 이 유형이야" 했더니 바로 "아 맞아 너 그럴 것 같았어" 하더라구요 ㅋㅋ 주변에서도 인정함.' },
  { name: '노수빈 (24)', text: '테스트 중에 유라 반응이 따뜻해서 좋았어요. 결과 나왔을 때 "맞아, 이래서 힘들었구나" 하는 느낌이었어요. 혼자 읽으면서 위로된 것 같아요.' },
  { name: '문성빈 (27)', text: '남자가 이런 거 하는 게 어색할 수 있는데 막상 해보니까 재밌어요. 어떻게 나올지 궁금해서 집중해서 하게 됐고 결과도 제법 맞았어요.' },
  { name: '양예원 (22)', text: '처음엔 심심해서 했는데 결과 보고 나서 스크린샷 찍어뒀어요. 나중에 연애할 때 참고해야겠다 싶어서요. 약점이랑 조언 파트가 특히 도움됐어요.' },
  { name: '조인호 (26)', text: '제 연애 패턴이 이거였구나 싶었어요. 읽으면서 고개 끄덕이게 되는 순간이 많았고 특히 위험한 유형 설명이 전 연애 생각나게 해서 좀 뜨끔했어요.' },
  { name: '허다인 (23)', text: '친구 네 명이랑 같이 했는데 다들 다른 유형 나와서 서로 비교하는 게 재밌었어요ㅋㅋ 우리 연애 스타일이 이렇게 다르구나 알게 됐어요.' },
  { name: '노재현 (29)', text: '30대 앞두고 연애 패턴을 한번 정리해보고 싶었는데 이게 딱 그 역할을 해줬어요. 짧고 핵심만 있어서 읽기 편했고 공감도 잘 됐어요.' },
  { name: '고나래 (24)', text: '읽씹 받으면 어떻게 하나요 물어보는 문항에서 저 그냥 웃었어요ㅋㅋㅋ 너무 현실적인 질문이라서. 결과도 공감 백 퍼센트였어요.' },
  { name: '양승현 (25)', text: '연애 쪽 조언이 생각보다 구체적이어서 좋았어요. "이렇게 해라" 식이 아니라 이해할 수 있게 설명해줘서 거부감 없이 읽혔어요.' },
  { name: '서민아 (26)', text: '결과 유형 설명이 자세해서 읽는 재미가 있어요. 핵심 성향부터 약점, 조언까지 다 있어서 진짜 내 얘기 들어주는 느낌이었어요.' },
  { name: '허민재 (27)', text: '테스트 문항이 다 실제 상황 기반이라서 고르는 데 고민됐어요ㅋㅋ "나 이거 두 개 다 해본 것 같은데" 싶은 게 있어서 더 현실적으로 느껴졌어요.' },
  { name: '전지현 (22)', text: '여자 친구들이랑 단톡에 올렸더니 다들 해보고 난리났어요ㅋㅋㅋ 저마다 다른 유형 나와서 서로 비교하면서 얘기가 엄청 길어졌어요.' },
  { name: '고태현 (24)', text: '이런 테스트가 보통 뻔하잖아요. 근데 이건 결과가 생각보다 구체적이고 읽을수록 "아 이런 면이 있었나" 하는 게 나와서 흥미로웠어요.' },
  { name: '남은혜 (25)', text: '질문이 10개밖에 안 되는데 이렇게 분석이 되는 게 신기했어요. 빠르게 할 수 있는데 결과는 꽤 자세해서 가성비 좋은 테스트예요ㅋㅋ' },
  { name: '서준영 (28)', text: '제가 연애할 때 애매하면 직접 확인하는 스타일이거든요. 결과에 딱 그게 나와서 "나 이미 알고 있었는데 맞네" 하는 기분이었어요.' },
  { name: '도하연 (21)', text: '처음 해봤는데 진짜 맞아요ㅠㅠ 특히 좋아하면 티 내기 싫어서 더 쿨한 척한다는 부분이 너무 저였어요. 친구한테 바로 보냈어요.' },
  { name: '전도현 (26)', text: '결과 보면서 "맞아, 나 이러다가 기회 놓친 적 있어" 싶은 부분이 있었어요. 읽고 나서 좀 반성하게 됐어요 ㅋㅋ 도움됐습니다.' },
  { name: '천서윤 (23)', text: '유라 말투가 진짜 누나 같아서 읽으면서 친근했어요. 결과 설명해주는 방식이 딱딱하지 않고 따뜻해서 부담 없이 읽혔어요.' },
  { name: '남기현 (27)', text: '이거 하고 나서 제 연애 스타일이 이름 붙여진 느낌이었어요ㅋㅋ 뭔가 정의가 되니까 오히려 편하더라구요. 친구한테도 시켰어요.' },
  { name: '임하은 (24)', text: '결과 읽다가 약점 파트에서 진짜 찔렸어요. 제가 감정 올라오면 잠수 타는 거 알고 있었는데 글로 딱 보니까 반성하게 됐어요ㅠ' },
  { name: '도경준 (25)', text: '주변 사람들한테 다 해보게 했어요. 결과 유형으로 대화하면 서로 이해가 더 잘 되더라구요. 연인이랑 같이 하면 진짜 좋을 것 같아요.' },
  { name: '배나리 (22)', text: '답 고르면 유라가 반응해주는 게 좋았어요. 그냥 문항만 있는 게 아니라 대화하는 느낌이어서 더 집중하게 됐어요. 결과도 잘 맞아요.' },
  { name: '천상욱 (29)', text: '나이 먹을수록 내 연애 패턴이 궁금해졌는데 이게 딱 정리해줬어요. 읽으면서 "아 나 이런 사람이었구나" 하는 순간이 있었어요.' },
  { name: '강하은 (26)', text: '테스트 분위기가 부드럽고 말투가 친근해서 거부감 없이 끝까지 했어요. 결과도 짧지 않고 꽤 길게 나와서 읽는 재미가 있어요.' },
  { name: '오재현 (24)', text: '이거 인스타에서 봐서 해봤는데 생각보다 퀄리티가 좋아요. 결과 캡처해서 저장해뒀고 친구들한테 링크 보냈더니 다들 바로 했어요.' },
  { name: '윤지아 (23)', text: '결과에 "이런 적 있지 않아?" 파트가 있는데 거기서 진짜 소름 돋았어요. 전부 "응 있어" 였거든요ㅋㅋㅋ 너무 잘 맞았어요.' },
  { name: '김태현 (26)', text: '연애 테스트는 항상 결과가 너무 좋게만 나오잖아요. 근데 이건 약점을 솔직하게 얘기해줘서 오히려 신뢰가 갔어요. 발전 방향도 있고 좋았어요.' },
  { name: '오서연 (25)', text: '혼자 하는 거보다 좋아하는 사람이랑 같이 하면 진짜 재밌을 것 같아요. 서로 결과 보고 "아 네가 이런 스타일이었구나" 할 수 있으니까요.' },
  { name: '이민호 (27)', text: '읽으면서 전 연애가 자꾸 생각났어요. "아 이래서 그게 안 됐구나" 하는 포인트들이 있었거든요. 씁쓸한데 도움되는 느낌이었어요 ㅋㅋ' },
  { name: '김서연 (21)', text: '대학 친구들이랑 단톡에서 같이 했는데 완전 난리났어요ㅋㅋ 각자 유형 나눠서 서로 분석해주는 게 재밌었어요. 강추합니다!!' },
  { name: '박준영 (28)', text: '제 연애에서 반복되는 실수가 있는데 이 테스트 결과 보고 나서 왜 그런지 좀 이해됐어요. 단순한 테스트라고 생각했는데 꽤 깊이 있네요.' },
  { name: '최아린 (24)', text: '말투가 진짜 좋아요. AI 느낌 없고 진짜 언니가 얘기해주는 것 같아서. 결과도 읽기 편하게 쓰여 있고 내용도 알차서 좋았어요.' },
  { name: '한동훈 (25)', text: '여자친구랑 같이 했는데 서로 결과 보여주면서 "맞아 넌 이랬어" "나도 이거 인정" 하면서 한참 얘기했어요. 커플 추천 콘텐츠예요 ㅋㅋ' },
  { name: '이예린 (22)', text: '한 번 더 하면 결과 달라질까 싶어서 두 번 했는데 비슷하게 나왔어요ㅋㅋ 일관성 있게 나오는 거 보면 꽤 신뢰도 있는 것 같아요.' },
  { name: '장민준 (27)', text: '이거 하고 나서 내가 왜 먼저 연락을 잘 못 하는지 알게 됐어요. 그게 패턴이었던 거더라구요. 인식하고 나니까 고치고 싶어졌어요.' },
  { name: '조하늘 (24)', text: '결과 중에 "잘 맞는 유형" "위험한 유형" 나오는 부분이 제일 흥미로웠어요. 현재 좋아하는 사람이 어떤 유형인지 생각해보게 됐어요 ㅋㅋ' },
  { name: '서재원 (26)', text: '평소에 연애 얘기 잘 안 하는데 이거 하면서 내 패턴을 스스로 정리하게 됐어요. 뭔가 내 마음 속 일기를 읽은 느낌이랄까요.' },
  { name: '김나윤 (23)', text: '오빠한테 보여줬더니 "이거 너 완전 딱이다" 라고ㅋㅋ 가족도 아는 내 연애 패턴이 여기 다 나와있었어요. 신기하고 웃겼어요.' },
  { name: '이성민 (29)', text: '20대 끝자락에 내 연애 패턴 한번 점검해보자 싶어서 해봤어요. 생각보다 진지한 내용이어서 끝나고도 한동안 생각했어요.' },
  { name: '박다은 (22)', text: '질문 하나하나가 다 연애에서 실제로 겪는 상황이라서 공감하면서 했어요. 결과 나올 때 "어 이거 맞는 것 같은데?" 싶었어요ㅋㅋ' },
  { name: '최준수 (25)', text: '남자친구가 해보라고 해서 했어요. 결과 보여줬더니 "너 이런 면이 있었어?" 하면서 서로 알게 된 게 있어서 오히려 좋았어요.' },
  { name: '정하연 (26)', text: '이음나루 유라 말투가 진짜 편안해요. 채팅하는 느낌이라서 테스트인 줄 모르고 대화하다 보니까 끝났어요. 결과도 꽤 맞아요.' },
  { name: '김현우 (24)', text: '결과 유형 설명이 너무 공감돼서 스크린샷 여러 장 찍었어요. 나 자신을 이해하는 데 도움이 됐고 친구한테도 알려줬어요.' },
  { name: '박소현 (21)', text: '연애 많이 안 해봤는데도 "아 나 이런 성향이구나" 하는 걸 알게 됐어요. 나중에 연애할 때 이런 점 주의해야겠다 싶었어요.' },
  { name: '이동현 (28)', text: '친구들이랑 각자 유형 얘기하는 게 요즘 유행이더라구요ㅋㅋ 이 테스트 기반으로 얘기 나누는 게 재밌어서 단톡에서 다들 했어요.' },
  { name: '최민서 (23)', text: '읽다가 트라우마 건드리는 부분이 있어서 잠깐 멈췄어요ㅠ 근데 맞는 말이라 부정할 수가 없었어요. 조언이 위로가 됐어요.' },
  { name: '황재호 (27)', text: '예상보다 결과가 길게 나와서 읽는 데 시간이 좀 걸렸어요. 근데 읽을수록 "맞아" 하는 게 나와서 끝까지 다 읽었어요.' },
  { name: '이지우 (25)', text: '같은 실수를 반복하는 이유가 이 테스트 보면서 조금 이해됐어요. 몰랐던 내 패턴을 발견하는 느낌이어서 유익했어요.' },
  { name: '박건우 (26)', text: '처음에 가볍게 시작했는데 결과 보니까 생각보다 진지한 내용이라서 집중해서 읽게 됐어요. 끝나고 나서도 계속 생각났어요.' },
  { name: '김아영 (22)', text: '친구 6명이랑 같이 했는데 다들 다른 유형 나왔어요. 서로 유형 설명해주면서 "너 진짜 이거다" "이거 맞지?" 하는 게 너무 재밌었어요ㅋㅋ' },
  { name: '정민호 (29)', text: '30 되기 전에 내 연애 스타일 정리해보자고 했는데 딱 맞는 내용이 나왔어요. 결과 보고 나서 다음 연애는 좀 다르게 해봐야겠다 싶었어요.' },
  { name: '한지은 (24)', text: '약점 설명이 구체적이어서 좋았어요. 보통 "이런 점이 있다" 만 나오는데 이건 왜 그런지도 설명이 있어서 더 이해가 됐어요.' },
  { name: '오주현 (26)', text: '제 전 남자친구한테 해보라고 했으면 좋았겠다 싶었어요ㅋㅋ 서로 이해가 조금 더 됐을 것 같아서요. 지금 좋아하는 사람한테 보낼 예정이에요.' },
  { name: '강지훈 (25)', text: '유라 말투가 AI 느낌 없이 진짜 사람 같아서 좋았어요. 결과도 공감 포인트가 많고 읽으면서 많이 생각하게 됐어요.' },
  { name: '신민아 (23)', text: '결과에서 "이런 적 있지 않아?" 체크리스트 부분이 제일 무서웠어요ㅋㅋㅋ 다 해봤거든요. 숨기고 싶었는데 다 들켰어요.' },
  { name: '이찬호 (27)', text: '제 패턴을 누군가 옆에서 지켜봤다가 정리해준 느낌이에요. 결과 정확도가 높아서 신뢰가 갔고 친구한테도 추천했어요.' },
  { name: '박지수 (22)', text: '연애 많이 안 했는데도 공감되는 부분이 있어서 신기했어요. 아직 경험이 없어도 내 성향이 이미 있었다는 게 재밌었어요.' },
  { name: '최태영 (28)', text: '결과가 생각보다 부드럽게 나와서 좋았어요. 약점 얘기도 무안하지 않게 써져 있고 읽기 편했어요. 내용도 맞고 추천해요.' },
  { name: '임수연 (24)', text: '썸남한테 해보라고 했더니 결과 보내줬는데 서로 유형 알게 돼서 대화가 자연스럽게 이어졌어요ㅋㅋ 핑계 만들기 좋아요.' },
  { name: '권민준 (26)', text: '남자인 제가 연애 테스트 공유하면 이상할까봐 망설였는데 주변에 보냈더니 오히려 친구들이 더 좋아했어요ㅋㅋ 다들 해봤어요.' },
  { name: '조유진 (21)', text: '유라가 대답할 때마다 위로해주는 느낌이었어요. 결과도 따뜻하게 써져 있어서 기분 좋게 마무리됐어요. 자주 돌아올 것 같아요.' },
  { name: '박현수 (27)', text: '제가 연애할 때 왜 항상 비슷한 상황이 반복되는지 궁금했는데 결과 보고 나서 "아, 내가 이런 패턴이어서 그랬구나" 싶었어요.' },
  { name: '김하늘 (25)', text: '읽다가 "이거 진짜 맞아" 싶은 문장에 형광펜 치고 싶었어요ㅋㅋ 나중에 다시 보려고 스크린샷 저장해뒀어요. 유용해요.' },
  { name: '이태준 (24)', text: '결과가 이렇게 잘 나올 줄 몰랐어요. 질문 개수 대비 결과가 풍성하더라구요. 전체 읽는 데 생각보다 시간 걸렸어요ㅋㅋ' },
  { name: '정예은 (22)', text: '테스트 UI가 예쁘고 말투가 친근해서 편하게 할 수 있었어요. 결과도 읽기 좋게 구성돼 있어서 전체 다 읽게 됐어요.' },
  { name: '오승환 (29)', text: '20대 마지막에 내 연애 복기하는 기분으로 해봤어요. 결과 보면서 "맞아, 나 이랬지" 하는 게 꽤 있어서 반성도 하고 좋았어요.' },
  { name: '윤서현 (23)', text: '결과 유형이 9개나 있는 게 신기했어요. 친구들이랑 같이 하면서 "나는 이거, 너는 이거" 맞히는 게 재밌었어요ㅋㅋ' },
  { name: '강민규 (25)', text: '남자 친구들한테 공유했더니 처음엔 "이거 뭐야" 했다가 결과 보고 나서 다들 진지해졌어요ㅋㅋ 맞는 게 많아서 인정하게 됐나봐요.' },
  { name: '이수아 (26)', text: '연애 상담을 받는 느낌이었어요. 결과에 진단만 있는 게 아니라 어떻게 하면 좋을지도 나와서 실용적이었어요. 저장해뒀어요.' },
  { name: '박도현 (27)', text: '이거 결과가 너무 정확해서 소름 돋았어요. 상대 접속 시간 확인하는 거 맞고, 싸우면 잠수 타는 것도 맞고… 들켰네요ㅋㅋ' },
  { name: '최수빈 (21)', text: '연애 경험이 많지 않아도 내 성향을 미리 알 수 있어서 도움됐어요. 앞으로 연애할 때 이런 점 주의하면 되겠다 싶었어요.' },
  { name: '류준혁 (28)', text: '결과 보고 나서 혼자 좀 생각했어요. 내가 이런 유형이라는 게 충격은 아닌데 글로 딱 보니까 뭔가 달라지는 느낌이에요.' },
  { name: '장혜진 (24)', text: '약점 파트에서 "맞아, 나 이래서 힘들었구나" 하는 순간이 있었어요. 결과 읽으면서 혼자 정리가 되는 느낌이라 좋았어요.' },
  { name: '서지훈 (26)', text: '친구 추천으로 했는데 생각보다 시간 가는 줄 모르고 했어요. 결과도 구체적이고 말투도 좋아서 부담 없이 읽혔어요.' },
  { name: '김예진 (22)', text: '혼자서 조용히 했는데 읽으면서 몇 번 멈췄어요. 너무 정확해서 감정이 올라왔거든요ㅠ 정리되는 느낌이라 고마웠어요.' },
  { name: '이현준 (27)', text: '연애 테스트가 원래 뻔하다고 생각했는데 이건 달랐어요. 패턴이 왜 생기는지 방향성을 잡아줘서 단순한 테스트 이상이었어요.' },
  { name: '박나린 (25)', text: '결과 읽으면서 "내가 이런 사람이구나" 하는 걸 새삼 확인한 것 같아요. 친구한테 보여줬더니 "완전 너야" 라고 했어요ㅋㅋ' },
  { name: '최재원 (23)', text: '10개 문항인데 결과가 꽤 길게 나와서 놀랐어요. 핵심 성향부터 조언까지 다 담겨있어서 읽는 재미가 있었어요.' },
]

// 후기 카드 별점 패턴 (3·4·5 혼합, 30개 주기)
const STAR_PATTERN = [5,5,4,5,5,4,5,3,5,4,5,5,4,5,5,3,5,4,5,5,4,5,5,3,5,4,5,5,4,3]

/* ── 재마운트/깜박임 방지를 위해 컴포넌트는 모듈 최상위에 고정 정의 ── */

function Avatar({ size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: '#fff', fontSize: size * 0.4, fontWeight: 900,
      boxShadow: '0 0 14px rgba(192,132,252,.4)' }}>
      <img src={HERO} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }}
        onError={e => { e.target.style.display = 'none' }} />
    </div>
  )
}

function FitCard({ label, value, danger }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: '14px 13px', borderRadius: 13,
      background: danger ? 'rgba(240,123,184,.09)' : 'rgba(192,132,252,.10)',
      border: `1px solid ${danger ? 'rgba(240,123,184,.28)' : 'rgba(192,132,252,.24)'}` }}>
      <div style={{ fontSize: 10.5, color: danger ? '#F07BB8' : LILAC, fontWeight: 900, letterSpacing: '1.2px', marginBottom: 7 }}>
        {label}
      </div>
      <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800, lineHeight: 1.45 }}>{value}</div>
    </div>
  )
}

function RankCard({ type, c, imgSrc }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: 'rgba(255,255,255,.065)', border: '1px solid rgba(255,255,255,.10)', boxShadow: '0 14px 34px rgba(0,0,0,.18)' }}>
      {/* 이미지 */}
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(type.key)} alt={type.name} style={{ width: '100%', height: 'auto', display: 'block' }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.display = 'none' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, padding: '7px 13px', borderRadius: 999,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', border: `1px solid ${c.accent}66`,
          color: '#fff', fontSize: 12, fontWeight: 900, letterSpacing: '1px' }}>
          나의 연애 프로파일
        </div>
      </div>

      {/* 분석 내용 */}
      <div style={{ padding: '20px 18px 20px' }}>
        <h2 style={{ fontSize: 24, color: '#fff', fontWeight: 900, lineHeight: 1.3, margin: '0 0 5px' }}>{type.name}</h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.56)', lineHeight: 1.5, margin: '0 0 18px', fontWeight: 700 }}>{type.tagline}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 핵심 성향 */}
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>핵심 성향</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.85, margin: 0 }}>{type.core}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 치명적인 약점 */}
          <div>
            <div style={{ fontSize: 11, color: '#F07BB8', fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>치명적인 약점</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.72)', lineHeight: 1.85, margin: 0 }}>{type.weakness}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 연애 조언 */}
          <div>
            <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 8 }}>연애 조언</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.74)', lineHeight: 1.85, margin: 0 }}>{type.advice}</p>
          </div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 연애 패턴 체크 */}
          {type.traits && type.traits.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.4px', marginBottom: 10 }}>이런 적 있지 않아?</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {type.traits.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      background: `${c.accent}22`, border: `1px solid ${c.accent}55`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: c.accent, fontWeight: 900 }}>✓</span>
                    <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,.72)', lineHeight: 1.6 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)' }} />

          {/* 잘 맞는 / 위험한 유형 */}
          <div style={{ display: 'flex', gap: 10 }}>
            <FitCard label="잘 맞는 유형" value={type.match} />
            <FitCard label="위험한 유형" value={type.danger} danger />
          </div>

          {/* 유라의 한 줄 경고 */}
          {type.trap && (
            <div style={{ padding: '13px 15px', borderRadius: 13,
              background: 'rgba(0,0,0,.25)', border: `1px solid ${c.accent}33` }}>
              <div style={{ fontSize: 10.5, color: c.accent, fontWeight: 900, letterSpacing: '1.3px', marginBottom: 7 }}>유라의 한 줄</div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.68)', lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
                "{type.trap}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ c }) {
  const trackRef = useRef(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onDown = (e) => {
    dragging.current = true
    const x = e.touches ? e.touches[0].pageX : e.pageX
    startX.current = x - trackRef.current.offsetLeft
    scrollLeft.current = trackRef.current.scrollLeft
    trackRef.current.style.cursor = 'grabbing'
  }
  const onMove = (e) => {
    if (!dragging.current) return
    e.preventDefault()
    const x = e.touches ? e.touches[0].pageX : e.pageX
    const walk = (x - trackRef.current.offsetLeft - startX.current) * 1.3
    trackRef.current.scrollLeft = scrollLeft.current - walk
  }
  const onUp = () => {
    dragging.current = false
    if (trackRef.current) trackRef.current.style.cursor = 'grab'
  }

  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,.055)', border: '1px solid rgba(255,255,255,.10)' }}>
      <div style={{ padding: '14px 16px 10px' }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.3px' }}>
          실제 후기 · 드래그해서 더 보기 →
        </div>
      </div>
      <div
        ref={trackRef}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
        style={{
          display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 16px',
          cursor: 'grab', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
          userSelect: 'none', msOverflowStyle: 'none',
        }}>
        {REVIEWS.map((r, i) => (
          <div key={i} style={{ flexShrink: 0, width: 230, padding: '12px 13px', borderRadius: 12,
            background: 'rgba(0,0,0,.2)', border: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.9)', fontWeight: 800 }}>{r.name}</span>
              <span style={{ fontSize: 11, color: '#FBBF24', letterSpacing: 1 }}>
                {'★'.repeat(STAR_PATTERN[i % STAR_PATTERN.length])}{'☆'.repeat(5 - STAR_PATTERN[i % STAR_PATTERN.length])}
              </span>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.6)', lineHeight: 1.65, margin: 0 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PromoCard({ c }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: `linear-gradient(160deg, rgba(155,93,229,.18), rgba(192,132,252,.08))`,
      border: `1px solid ${c.accent}44`, boxShadow: '0 14px 34px rgba(0,0,0,.2)' }}>
      <div style={{ padding: '22px 18px 20px' }}>
        {/* 배지 */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999,
          background: `${c.accent}22`, border: `1px solid ${c.accent}55`, marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          <span style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.2px' }}>이음나루 무료 프로그램</span>
        </div>

        <h2 style={{ fontSize: 20, color: '#fff', fontWeight: 900, lineHeight: 1.4, margin: '0 0 10px' }}>
          연애 패턴, 이제 진짜로 바꿔볼 준비 됐어?
        </h2>
        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.65)', lineHeight: 1.75, margin: '0 0 18px' }}>
          테스트 결과는 시작일 뿐이야. 이음나루에서는 네 패턴이 왜 반복되는지 뿌리부터 짚어주고, 실제 관계에서 어떻게 달라질 수 있는지 함께 설계해줘.
        </p>

        {/* 프로그램 3단계 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {[
            { step: '01', title: '토크쇼', desc: '같은 패턴이 반복되는 이유, 뿌리부터 짚어줘' },
            { step: '02', title: '1:1 연애코치', desc: '너한테 맞는 관계 방향을 코치와 직접 설계' },
            { step: '03', title: 'IDT 검사지', desc: '내 마음이 연애에서 어떻게 작동하는지 데이터로 확인' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '12px 13px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: c.accent, letterSpacing: '1px',
                padding: '3px 7px', borderRadius: 6, background: `${c.accent}22`, flexShrink: 0, marginTop: 1 }}>{step}</span>
              <div>
                <div style={{ fontSize: 13.5, color: '#fff', fontWeight: 800, marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* 추가 혜택 */}
        <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(0,0,0,.2)', marginBottom: 18,
          border: '1px solid rgba(255,255,255,.07)' }}>
          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.45)', fontWeight: 900, letterSpacing: '1.2px', marginBottom: 8 }}>신청하면 같이 줘</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['애착 유형 심화 분석', '연애 회피 패턴 체크', '이상형 vs 실제 끌리는 유형', '연애 준비도 점수'].map(item => (
              <span key={item} style={{ fontSize: 11.5, color: 'rgba(255,255,255,.65)', padding: '4px 9px',
                borderRadius: 99, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* 선착순 안내 */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', textAlign: 'center', margin: '0 0 14px', lineHeight: 1.6 }}>
          20·30대 한정 · <span style={{ color: c.accent, fontWeight: 900 }}>선착순 30명</span> · 무료
        </p>

        {/* CTA 버튼 */}
        <a href="https://ieumnaru.co.kr/ieumnaru-detail" target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', padding: '16px 0', borderRadius: 14, textAlign: 'center',
            background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, color: '#fff',
            fontSize: 16, fontWeight: 900, textDecoration: 'none', boxShadow: `0 10px 28px rgba(155,93,229,.4)`,
            fontFamily: 'inherit' }}>
          이음나루 무료 프로그램 자세히 보기 →
        </a>
      </div>
    </div>
  )
}

function LockedImgCard({ type, imgSrc, c }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 18, overflow: 'hidden',
      background: 'rgba(255,255,255,.065)', border: `1px solid ${c.accent}44`,
      boxShadow: '0 14px 34px rgba(0,0,0,.22)' }}>
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(type.key)} alt="" style={{ width: '100%', height: 'auto', display: 'block',
          filter: 'blur(18px)', transform: 'scale(1.1)', opacity: .65 }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.minHeight = '180px' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(14,8,22,.38)' }}>
          <div style={{ fontSize: 28 }}>🔒</div>
          <div style={{ fontSize: 14, color: '#fff', fontWeight: 900, padding: '10px 20px', borderRadius: 999,
            background: 'rgba(0,0,0,.65)', border: `1px solid ${c.accent}88`, textAlign: 'center' }}>
            신청 후 바로 공개돼
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>네 연애 프로파일 이미지</div>
        </div>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.accent, flexShrink: 0,
          boxShadow: `0 0 8px ${c.accent}` }} />
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)', fontWeight: 700 }}>
          분석 완료 · 결과 이미지가 준비됐어
        </span>
      </div>
    </div>
  )
}

function LockedSection({ eyebrow, title, c }) {
  return (
    <div style={{ position: 'relative', padding: '16px 16px 15px', borderRadius: 14,
      background: 'rgba(255,255,255,.055)', border: `1px solid ${c.accent}33`, overflow: 'hidden' }}>
      <div style={{ filter: 'blur(5px)', userSelect: 'none', opacity: .54 }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.6px', marginBottom: 8 }}>{eyebrow}</div>
        <h2 style={{ fontSize: 16, color: '#fff', lineHeight: 1.45, margin: '0 0 10px', fontWeight: 850 }}>{title}</h2>
        <div style={{ height: 10, width: '93%', borderRadius: 8, background: 'rgba(255,255,255,.50)', marginBottom: 9 }} />
        <div style={{ height: 10, width: '86%', borderRadius: 8, background: 'rgba(255,255,255,.38)', marginBottom: 9 }} />
        <div style={{ height: 10, width: '64%', borderRadius: 8, background: 'rgba(255,255,255,.28)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(14,8,22,.46)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '8px 15px', borderRadius: 999,
          color: '#fff', background: 'rgba(0,0,0,.62)', border: `1px solid ${c.accent}77`, fontSize: 12.5, fontWeight: 900 }}>
          🔒 더 알아보기 후 공개
        </div>
      </div>
    </div>
  )
}

function LockedFirst({ first, user, c, imgSrc }) {
  return (
    <div className="fade-in" style={{ alignSelf: 'stretch', borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(180deg, rgba(255,255,255,.09), rgba(255,255,255,.045))',
      border: '1px solid rgba(255,255,255,.12)', boxShadow: '0 20px 55px rgba(0,0,0,.28)' }}>
      {/* 흐릿한 1위 이미지 (별도 영역) */}
      <div style={{ position: 'relative', background: '#160C24', lineHeight: 0 }}>
        <img src={imgSrc(first.key)} alt="" style={{ width: '100%', height: 'auto', display: 'block',
          filter: 'blur(11px)', transform: 'scale(1.06)', opacity: .82 }}
          onError={e => { const w = e.target.parentElement; if (w) w.style.minHeight = '150px' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 8, background: 'rgba(14,8,22,.30)' }}>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 900, padding: '9px 16px', borderRadius: 999,
            background: 'rgba(0,0,0,.6)', border: `1px solid ${c.accent}88` }}>🔒 1위 이미지 잠금</span>
        </div>
      </div>

      {/* 분석 내용 (잠금) */}
      <div style={{ padding: '18px 17px 17px' }}>
        <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.6px', marginBottom: 7 }}>{user.name}의 1위 프로파일</div>
        <h1 style={{ fontSize: 28, color: '#fff', lineHeight: 1.2, fontWeight: 950, margin: '0 0 7px' }}>{first.name}</h1>
        <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.68)', lineHeight: 1.5, margin: '0 0 14px', fontWeight: 700 }}>{first.tagline}</p>

        <div style={{ padding: '13px 14px', borderRadius: 14, background: 'rgba(0,0,0,.22)', border: '1px solid rgba(255,255,255,.09)', marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 900, letterSpacing: '1.5px', marginBottom: 7 }}>{UNAIT.name}의 한 줄 판독</div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.78)', lineHeight: 1.75, margin: 0 }}>
            "{UNAIT.quote} 1위는 네가 반복해서 선택한 가장 강한 패턴이야."
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <LockedSection eyebrow="CORE PATTERN" title="1위 핵심 성향 설명" c={c} />
          <LockedSection eyebrow="WEAK POINT" title="1위 치명적인 약점" c={c} />
          <LockedSection eyebrow="ADVICE" title="1위 연애 조언과 궁합" c={c} />
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const resultKeys = store.getResult()
  const user = store.getUser()

  // 인트로~퀴즈에서 이어진 대화를 그대로 이어받아 결과를 덧붙인다
  const [items, setItems] = useState(() => store.getChat())   // { from, text, soft } | { kind:'card3'|'card2'|'lock' }
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState(null)  // 'continue' | 'cta' | 'declined' | 'applying' | 'done' | null
  const [step, setStep] = useState(0)
  const [applyStep, setApplyStep] = useState(0)
  const [draft, setDraft] = useState('')
  const [etcMode, setEtcMode] = useState(false)   // 직업 '기타' → 직접 입력 모드

  const scrollRef = useRef(null)
  const timers = useRef([])
  const started = useRef(false)
  const initialCount = useRef(store.getChat().length)  // 불러온 과거 대화 (재진입 시 애니메이션 안 함)
  const didFirstScroll = useRef(false)
  const stepsRef = useRef(APPLY_STEPS)   // 현재 진행 중인 신청 단계 목록 (수정 선택 시 EDIT_STEPS가 앞에 붙음)
  const dataRef = useRef({              // 시트로 보낼 누적 답변 (이름·나이·성별은 테스트값으로 시작)
    name: user?.name || '', age: user?.age ? String(user.age) : '', gender: user?.gender || '',
    phone: '', job: '', location: '', calltime: '', concern: '', source: '',
  })
  const after = (ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => { if (!resultKeys || !user) navigate('/') }, [])

  const first = resultKeys ? TYPES[resultKeys.first] : null
  const second = resultKeys ? TYPES[resultKeys.second] : null
  const third = resultKeys ? TYPES[resultKeys.third] : null
  const c = first ? first.color : { accent: LILAC, chip: PURPLE }
  const imgSrc = useCallback(
    (key) => `${import.meta.env.BASE_URL}images/result-${key}-${(dataRef.current.gender || user?.gender) === '남자' ? 'male' : 'female'}.png`,
    [user?.gender],
  )

  // 결과는 신청 후에만 공개하는 대본
  const BEATS = first ? [
    { msgs: [`${user.name}, 분석 다 됐어 :)`, RESULT_STORY.yura], cards: ['lockedimg'], end: 'continue', cont: '오, 결과 보여줘!' },
    { msgs: ['연애테스트 하러 왔지만,', '사실 연애하기 전에 요즘 필수로 하는 것이 있어.'], cards: [], end: 'continue', cont: '오 뭔데?' },
    { msgs: ['요즘 내가 직접 개발한 테스트지가 있는데,'], cards: ['review'], end: 'continue', cont: 'ㅋㅋ 진짜 핫하다' },
    { msgs: ['크게 세 가지인데,', '① 토크쇼 — 왜 같은 패턴이 반복되는지 뿌리부터 같이 봐줘', '② 1:1 연애코치 — 나한테 맞는 연애 방향을 코치가 직접 설계해줘', '③ IDT 검사지 — 내 마음이 연애에서 어떻게 움직이는지 데이터로 확인할 수 있어'], cards: [], end: 'continue', cont: '나도 신청할 수 있어?' },
    { msgs: ['이번 기수는 자리가 많지 않아서 선착순 30명만 받고 있거든.', '신청하면 지금 바로 결과 다 볼 수 있어.'], cards: [], end: 'cta' },
  ] : []

  const playBeat = useCallback((i) => {
    const beat = BEATS[i]
    if (!beat) return
    setPhase(null)
    let idx = 0
    const pushCards = () => {
      if (!beat.cards || !beat.cards.length) { after(150, () => setPhase(beat.end)); return }
      after(400, () => {
        setTyping(true)
        after(500, () => {
          setTyping(false)
          beat.cards.forEach(k => setItems(m => [...m, { kind: k }]))
          after(300, () => setPhase(beat.end))
        })
      })
    }
    const step = () => {
      if (idx >= beat.msgs.length) { pushCards(); return }
      setTyping(true)
      const text = beat.msgs[idx]
      after(Math.min(800, 300 + text.length * 10), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(170, step)
      })
    }
    step()
  }, [first]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (started.current || !first) return
    started.current = true
    after(450, () => playBeat(0))
  }, [first]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: didFirstScroll.current ? 'smooth' : 'auto' })
    didFirstScroll.current = true
  }, [items, typing, phase])

  const onContinue = () => {
    if (phase !== 'continue') return
    const reply = BEATS[step]?.cont
    if (reply) setItems(m => [...m, { from: 'me', text: reply }])
    const ns = step + 1
    setStep(ns)
    setPhase(null)
    after(220, () => playBeat(ns))
  }

  const handleShare = async () => {
    const url = 'https://love-type-test.ieumnaru.co.kr/'
    const text = `나의 디엠 연애 프로파일은 '${first.name}'. 당신도 ${UNAIT.name}에게 분석받아보세요.`
    if (navigator.share) {
      try { await navigator.share({ title: '이음나루 디엠 프로파일러', text, url }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      } catch {}
    }
  }

  // 유라가 대본(BEATS) 밖에서 자유 메시지를 차례로 보내는 헬퍼 (신청 분기 대화용)
  const streamYura = useCallback((lines, done) => {
    let idx = 0
    const run = () => {
      if (idx >= lines.length) { done && done(); return }
      setTyping(true)
      const text = lines[idx]
      after(Math.min(800, 300 + text.length * 10), () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text }])
        idx += 1
        after(160, run)
      })
    }
    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 신청 질문 한 단계를 유라가 물어본 뒤 입력창/칩을 연다
  const askApplyStep = useCallback((i) => {
    const s = stepsRef.current[i]
    if (!s) return
    setEtcMode(false)
    setDraft('')
    setApplyStep(i)
    setPhase(null)
    streamYura(s.ask, () => setPhase('applying'))
  }, [streamYura]) // eslint-disable-line react-hooks/exhaustive-deps

  // 모든 단계 완료 → 시트로 접수 → 결과 전체 공개 (1위·2위·3위)
  const submitApply = () => {
    const d = dataRef.current
    const payload = {
      type: first.name, name: d.name, gender: d.gender, age: d.age || '',
      phone: d.phone, job: d.job, location: d.location, calltime: d.calltime, concern: d.concern, source: d.source,
    }
    try { fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(payload) }).catch(() => {}) } catch {}
    setPhase(null)
    after(400, () => {
      setTyping(true)
      after(700, () => {
        setTyping(false)
        setItems(m => [...m, { from: 'yura', text: `${d.name}, 신청 잘 받았어 :) 1영업일 안에 담당 코치가 연락드릴 거야.` }])
        after(300, () => streamYura(['약속대로 결과 바로 보여줄게 🔓'], () => {
          after(300, () => {
            setTyping(true)
            after(600, () => {
              setTyping(false)
              setItems(m => [...m, { kind: 'card1' }])
              after(400, () => {
                setItems(m => [...m, { from: 'yura', text: '지금 가장 강하게 나온 연애 패턴이야. 더 깊은 분석은 아래 프로그램에서 확인해봐.' }])
                after(300, () => {
                  setItems(m => [...m, { kind: 'promo' }])
                  after(250, () => setPhase('done'))
                })
              })
            })
          })
        }))
      })
    })
  }

  // 신청 답변 저장 → 다음 질문 또는 제출
  const saveApply = (value) => {
    const list = stepsRef.current
    const s = list[applyStep]
    dataRef.current[s.key] = value
    if (s.target === 'user') store.setUser({ ...store.getUser(), [s.key]: value })
    setItems(m => [...m, { from: 'me', text: value }])
    setDraft('')
    setEtcMode(false)
    setPhase(null)
    const ni = applyStep + 1
    if (ni >= list.length) after(450, () => submitApply())
    else after(450, () => askApplyStep(ni))
  }

  // 칩 선택 ('기타'는 직접 입력으로 전환)
  const onApplyChip = (value) => {
    if (value === '기타') { setEtcMode(true); return }
    saveApply(value)
  }

  // 텍스트/전화/직접입력 전송
  const submitApplyText = () => {
    const s = stepsRef.current[applyStep]
    const v = draft.trim()
    if (!v) return
    if (s.key === 'phone' && v.replace(/[^0-9]/g, '').length < 10) return
    saveApply(v)
  }

  // 신청 분기 ─ "응, 신청할래": 먼저 이름·나이·성별을 재확인한다
  const onApplyYes = () => {
    if (phase !== 'cta') return
    setItems(m => [...m, { from: 'me', text: '응, 나 신청할래' }])
    setPhase(null)
    after(220, () => streamYura([
      '좋아 :) 신청 전에 정보 한 번만 확인할게.',
      `이름은 ${user.name}, ${user.age}살, ${user.gender} — 맞지?`,
    ], () => setPhase('confirm')))
  }

  // 정보 확인 ─ "응, 맞아": 바로 신청 단계로
  const onConfirmYes = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '응, 맞아' }])
    stepsRef.current = APPLY_STEPS
    setPhase(null)
    after(220, () => streamYura(['확인했어, 그럼 바로 시작할게!'], () => askApplyStep(0)))
  }

  // 정보 확인 ─ "아니, 수정할게": 이름·나이·성별부터 다시 받고 이어서 신청
  const onConfirmNo = () => {
    if (phase !== 'confirm') return
    setItems(m => [...m, { from: 'me', text: '아니, 수정할게' }])
    stepsRef.current = [...EDIT_STEPS, ...APPLY_STEPS]
    setPhase(null)
    after(220, () => askApplyStep(0))
  }

  // 신청 분기 ─ "아니, 다음에": 유라가 아쉬워하며 마무리, 공유/재신청만 남긴다
  const onApplyNo = () => {
    if (phase !== 'cta') return
    setItems(m => [...m, { from: 'me', text: '아니, 다음에 할게' }])
    setPhase(null)
    after(420, () => streamYura([
      '알겠어, 억지로 권하진 않을게.',
      '근데 선착순 30명이라 자리 없어지면 다음 기수까지 기다려야 할 수 있어.',
      '마음 바뀌면 언제든 다시 와. 결과는 여기 남아 있을게.',
    ], () => setPhase('declined')))
  }

  if (!resultKeys || !user) return null

  const renderNode = (kind) => {
    if (kind === 'card1') return <RankCard type={first} c={c} imgSrc={imgSrc} />
    if (kind === 'promo') return <PromoCard c={c} />
    if (kind === 'review') return <ReviewCard c={c} />
    if (kind === 'lockedimg') return <LockedImgCard type={first} imgSrc={imgSrc} c={c} />
    return null
  }

  return (
    <div style={{ background: '#0E0816', height: '100dvh', fontFamily: FONT, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* 채팅 헤더 */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 11, padding: '14px 16px',
        borderBottom: '1px solid rgba(192,132,252,.14)', background: 'rgba(14,8,22,.92)', backdropFilter: 'blur(8px)' }}>
        <button onClick={() => navigate('/')} aria-label="처음으로"
          style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, border: '1px solid rgba(255,255,255,.12)',
            background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.7)', fontSize: 17, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT }}>←</button>
        <Avatar size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, color: '#fff', fontWeight: 800 }}>{UNAIT.name}</div>
          <div style={{ fontSize: 11, color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 8px #4ADE80' }} />
            {UNAIT.title} · 분석 완료
          </div>
        </div>
      </div>

      {/* 메시지 + 결과 카드 영역 */}
      <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        padding: '18px 16px 12px', display: 'flex', flexDirection: 'column', gap: 11 }}>
        {items.map((it, i) => (
          it.kind ? (
            <div key={i}>{renderNode(it.kind)}</div>
          ) : it.from === 'me' ? (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ alignSelf: 'flex-end', maxWidth: '82%' }}>
              <div style={{ padding: '12px 16px', borderRadius: '16px 4px 16px 16px',
                background: `linear-gradient(135deg, ${PURPLE}, ${LILAC})`, color: '#fff',
                fontSize: 15, lineHeight: 1.6, fontWeight: 600, boxShadow: '0 6px 18px rgba(155,93,229,.3)' }}>
                {it.text}
              </div>
            </div>
          ) : (
            <div key={i} className={i >= initialCount.current ? 'fade-in' : undefined} style={{ display: 'flex', alignItems: 'flex-end', gap: 8, maxWidth: '88%' }}>
              <Avatar />
              <div style={{ padding: it.soft ? '10px 14px' : '12px 15px', borderRadius: '4px 16px 16px 16px',
                background: it.soft ? 'rgba(192,132,252,.1)' : 'rgba(255,255,255,.08)',
                border: '1px solid rgba(192,132,252,.22)',
                color: it.soft ? 'rgba(255,255,255,.72)' : '#F3E8FF',
                fontSize: it.soft ? 13.5 : 15, lineHeight: 1.6, fontWeight: 600 }}>
                {it.soft ? `"${it.text}"` : it.text}
              </div>
            </div>
          )
        ))}

        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <Avatar />
            <div style={{ padding: '14px 16px', borderRadius: '4px 16px 16px 16px',
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(192,132,252,.22)', display: 'flex', gap: 5 }}>
              {[0, 1, 2].map(d => (
                <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: LILAC,
                  animation: 'azPulse 1.2s ease-in-out infinite', animationDelay: `${d * 0.18}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 하단: 다음 ▸ / 공유·신청 CTA */}
      <div style={{ flexShrink: 0, padding: '12px 16px 20px', borderTop: '1px solid rgba(255,255,255,.07)', background: '#0E0816' }}>
        {phase === 'continue' && (
          <button onClick={onContinue} style={{
            width: '100%', border: `1.5px solid ${c.accent}88`, background: 'rgba(192,132,252,.12)', color: '#fff',
            borderRadius: 16, padding: '15px', fontSize: 15.5, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
          }}>
            {(BEATS[step]?.cont || '다음') + ' ▸'}
          </button>
        )}

        {phase === 'cta' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,.5)', margin: '0 0 2px', lineHeight: 1.6 }}>
              <b style={{ color: c.accent }}>선착순 30명</b> · 신청하면 네 <b style={{ color: c.accent }}>1위</b>까지 다 풀어줄게 💜
            </p>
            <button onClick={onApplyYes} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16.5, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              응, 나 신청할래
            </button>
          </div>
        )}

        {phase === 'declined' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setPhase('cta')} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              역시 신청할래
            </button>
            <button onClick={handleShare} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: '#fff',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              {copied ? '링크 복사 완료' : '결과 공유하기'}
            </button>
          </div>
        )}

        {phase === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={onConfirmYes} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              응, 맞아
            </button>
            <button onClick={onConfirmNo} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: 'rgba(255,255,255,.7)',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              아니, 수정할게
            </button>
          </div>
        )}

        {phase === 'applying' && (() => {
          const s = stepsRef.current[applyStep]
          if (s.type === 'chips' && !etcMode) {
            return (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                {s.options.map(op => (
                  <button key={op} onClick={() => onApplyChip(op)} style={{
                    flex: s.options.length > 3 ? '1 1 28%' : 1, minWidth: 0,
                    padding: '13px 12px', borderRadius: 14, cursor: 'pointer', fontFamily: FONT,
                    border: `1.5px solid ${c.accent}55`, background: 'rgba(192,132,252,.1)',
                    color: '#fff', fontSize: 14, fontWeight: 700,
                  }}>{op}</button>
                ))}
              </div>
            )
          }
          const isPhone = s.key === 'phone'
          const ok = isPhone ? draft.replace(/[^0-9]/g, '').length >= 10 : draft.trim().length > 0
          return (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input autoFocus value={draft} inputMode={s.type === 'tel' ? 'numeric' : 'text'}
                maxLength={isPhone ? 13 : undefined}
                placeholder={etcMode ? '직접 입력해줘' : s.placeholder}
                onChange={e => setDraft(isPhone ? fmtPhone(e.target.value) : e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitApplyText() }}
                style={{ flex: 1, padding: '14px 16px', fontSize: 16, fontFamily: FONT,
                  border: `1.5px solid ${c.accent}55`, borderRadius: 22,
                  background: 'rgba(255,255,255,.07)', color: '#fff', outline: 'none' }} />
              <button onClick={submitApplyText} aria-label="보내기" style={{
                width: 46, height: 46, flexShrink: 0, borderRadius: '50%', border: 'none',
                cursor: ok ? 'pointer' : 'default',
                background: ok ? `linear-gradient(135deg, ${c.chip}, ${LILAC})` : 'rgba(255,255,255,.1)',
                color: ok ? '#fff' : 'rgba(255,255,255,.3)', fontSize: 19, fontWeight: 800 }}>↑</button>
            </div>
          )
        })()}

        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleShare} style={{
              width: '100%', border: 'none', background: `linear-gradient(135deg, ${c.chip}, ${LILAC})`, color: '#fff',
              borderRadius: 16, padding: '15px', fontSize: 15.5, fontWeight: 900, cursor: 'pointer', fontFamily: FONT,
              boxShadow: `0 14px 34px ${c.chip}55`,
            }}>
              {copied ? '링크 복사 완료' : '결과 공유하기'}
            </button>
            <button onClick={() => navigate('/')} style={{
              width: '100%', border: `1.5px solid ${c.accent}66`, background: 'rgba(192,132,252,.08)', color: 'rgba(255,255,255,.7)',
              borderRadius: 16, padding: '14px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: FONT,
            }}>
              처음으로
            </button>
          </div>
        )}

        {phase === null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: .5,
            padding: '14px 16px', borderRadius: 22, border: '1.5px solid rgba(192,132,252,.2)',
            background: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.35)', fontSize: 14 }}>
            유라가 입력 중…
          </div>
        )}
      </div>
    </div>
  )
}
