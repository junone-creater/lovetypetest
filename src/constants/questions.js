// 예/아니오 형식 — options[0]=예, options[1]=아니오
export const QUESTIONS = [
  {
    q: '상대 답장이 늦으면 마지막 접속 시간까지 확인해?',
    options: [
      { label: '예', score: 'keeper',
        reactions: ['역시… 마지막 접속까지 확인하는 편이구나.', '그거 불안해서 그런 거, 나도 알아.'] },
      { label: '아니오', score: 'grandma',
        reactions: ['담담하네. 쉽게 흔들리지 않는 쪽이구나.', '그 여유, 진짜 쉽지 않은 건데.'] },
    ],
  },
  {
    q: '마음에 드는 사람이 생기면 내가 먼저 연락해?',
    options: [
      { label: '예', score: 'hunter',
        reactions: ['먼저 보내는 게 어렵지 않구나.', '그 적극성, 은근 매력 있어.'] },
      { label: '아니오', score: 'cool',
        reactions: ['기다리는 쪽이구나.', '근데 속으론 알림 계속 보고 있지?'] },
    ],
  },
  {
    q: '상대 말투나 답장 패턴이 바뀌면 이유 분석해?',
    options: [
      { label: '예', score: 'analyst',
        reactions: ['분석하는 쪽이구나. 촉이 예리하네.', '근데 답 없는 분석이 더 지치기도 해.'] },
      { label: '아니오', score: 'romantic',
        reactions: ['분석보다 느낌으로 가는 쪽이네.', '그 감성 예쁜데, 가끔 다치지?'] },
    ],
  },
  {
    q: '좋아하는 사람이 힘들다고 하면 내 일처럼 마음 쓰여?',
    options: [
      { label: '예', score: 'mirror',
        reactions: ['공감이 깊구나. 남 얘긴데 더 아프지?', '근데 그러다 네가 먼저 지치는 거 조심해.'] },
      { label: '아니오', score: 'ghost',
        reactions: ['선 긋는 쪽이구나.', '혹시 감정에 거리 두는 게 습관인 거 아니야?'] },
    ],
  },
  {
    q: '상대가 힘들 때 어떻게든 해결해줘야 한다는 부담이 들어?',
    options: [
      { label: '예', score: 'rescuer',
        reactions: ['책임감이 먼저 오는 쪽이구나.', '근데 네가 다 짊어질 필요는 없어.'] },
      { label: '아니오', score: 'keeper',
        reactions: ['부담보다 그냥 옆에서 다 알고 싶어지는 쪽이구나.', '그 마음, 상대한테 제일 크게 닿아.'] },
    ],
  },
  {
    q: '연락이 잠깐 끊겨도 크게 불안하지 않아?',
    options: [
      { label: '예', score: 'grandma',
        reactions: ['흔들림이 적은 쪽이구나.', '그 여유, 연애에서 장점이야.'] },
      { label: '아니오', score: 'hunter',
        reactions: ['끊기면 내가 먼저 보내게 되지?', '못 참고 먼저 나서는 쪽, 나는 그게 솔직해서 좋아.'] },
    ],
  },
  {
    q: '좋아하는 티를 내기보다 상대 반응을 기다리는 편이야?',
    options: [
      { label: '예', score: 'cool',
        reactions: ['기다리는 쪽이구나.', '안 그런 척이 제일 귀여운 거 알지?'] },
      { label: '아니오', score: 'analyst',
        reactions: ['어떻게 다가갈지 먼저 계산하는 쪽이구나.', '그거 신중한 건데, 너무 오래 재면 놓쳐.'] },
    ],
  },
  {
    q: '싸우고 나면 잠수 타고 혼자 식히는 편이야?',
    options: [
      { label: '예', score: 'ghost',
        reactions: ['혼자 식히는 시간이 필요한 쪽이구나.', '근데 그동안 상대 속은 꽤 탈 거야.'] },
      { label: '아니오', score: 'mirror',
        reactions: ['빨리 풀고 싶어지는 쪽이구나.', '먼저 숙이더라도 편해지고 싶은 마음이지?'] },
    ],
  },
  {
    q: '인연이면 자연스럽게 이어지겠지, 흐름에 맡기는 편이야?',
    options: [
      { label: '예', score: 'romantic',
        reactions: ['운명에 맡기는 낭만이 있구나.', '그 마음 예쁜데, 가끔 놓치기도 해.'] },
      { label: '아니오', score: 'rescuer',
        reactions: ['흐름보다 직접 만들어가는 쪽이구나.', '관계를 지키고 싶은 마음이 강한 거야.'] },
    ],
  },
  {
    q: '감정이 생기면 망설이지 않고 표현하는 편이야?',
    options: [
      { label: '예', score: 'hunter',
        reactions: ['망설임이 없는 쪽이구나.', '그런 사람이 후회도 적더라.'] },
      { label: '아니오', score: 'keeper',
        reactions: ['숨기는 쪽이구나.', '말은 못 해도 마음속에 다 쌓이지?'] },
    ],
  },
]
