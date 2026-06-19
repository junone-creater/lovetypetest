// 예/아니오 형식 — options[0]=예, options[1]=아니오
export const QUESTIONS = [
  {
    q: '상대 답장이 늦으면 마지막 접속 시간까지 확인해?',
    options: [
      { label: '예', score: 'keeper',
        reactions: ['마지막 접속 시간까지 확인하는 편이구나.', '불안할 때 그러게 되지. 그 마음 이해해.'] },
      { label: '아니오', score: 'grandma',
        reactions: ['담담한 편이구나.', '그런 여유, 생각보다 쉽지 않은 건데.'] },
    ],
  },
  {
    q: '마음에 드는 사람이 생기면 내가 먼저 연락해?',
    options: [
      { label: '예', score: 'hunter',
        reactions: ['먼저 연락하는 게 자연스러운 편이구나.', '그 솔직함, 생각보다 매력 있어.'] },
      { label: '아니오', score: 'cool',
        reactions: ['기다리는 편이구나.', '근데 은근 알림은 계속 보게 되지 않아?'] },
    ],
  },
  {
    q: '상대 말투나 답장 패턴이 바뀌면 이유 분석해?',
    options: [
      { label: '예', score: 'analyst',
        reactions: ['분석하는 편이구나. 촉이 꽤 예리하네.', '근데 답 안 나오는 분석은 더 지칠 수 있거든.'] },
      { label: '아니오', score: 'romantic',
        reactions: ['분석보다 느낌으로 받아들이는 편이구나.', '그 감성 예쁜데, 그래서 더 속상할 때도 있지 않아?'] },
    ],
  },
  {
    q: '좋아하는 사람이 힘들다고 하면 내 일처럼 마음 쓰여?',
    options: [
      { label: '예', score: 'mirror',
        reactions: ['공감이 깊은 편이구나.', '그 마음 좋은데, 그러다 본인이 먼저 지칠 수 있으니까 조금 챙겨줘.'] },
      { label: '아니오', score: 'ghost',
        reactions: ['감정에 선을 좀 긋는 편이구나.', '혹시 일부러 거리 두는 게 습관이 된 건 아닐까?'] },
    ],
  },
  {
    q: '상대가 힘들 때 어떻게든 해결해줘야 한다는 부담이 들어?',
    options: [
      { label: '예', score: 'rescuer',
        reactions: ['책임감이 강한 편이구나.', '근데 혼자 다 짊어지려 하지 않아도 괜찮아.'] },
      { label: '아니오', score: 'keeper',
        reactions: ['옆에서 다 알아주고 싶어지는 편이구나.', '그런 마음, 상대한테 생각보다 크게 닿거든.'] },
    ],
  },
  {
    q: '연락이 잠깐 끊겨도 크게 불안하지 않아?',
    options: [
      { label: '예', score: 'grandma',
        reactions: ['흔들리지 않는 편이구나.', '그런 여유, 연애할 때 진짜 장점이 돼.'] },
      { label: '아니오', score: 'hunter',
        reactions: ['연락이 끊기면 먼저 보내게 되는구나.', '솔직하게 먼저 나서는 거, 나는 그게 좋더라.'] },
    ],
  },
  {
    q: '좋아하는 티를 내기보다 상대 반응을 기다리는 편이야?',
    options: [
      { label: '예', score: 'cool',
        reactions: ['상대 반응을 먼저 기다리는 편이구나.', '안 그런 척하면서도 신경 많이 쓰이지 않아?'] },
      { label: '아니오', score: 'analyst',
        reactions: ['어떻게 다가갈지 먼저 생각하는 편이구나.', '신중한 건 좋은데, 너무 오래 재다 보면 타이밍 놓칠 수 있어.'] },
    ],
  },
  {
    q: '싸우고 나면 잠수 타고 혼자 식히는 편이야?',
    options: [
      { label: '예', score: 'ghost',
        reactions: ['혼자 생각 정리하는 시간이 필요한 편이구나.', '근데 그 시간이 길어지면 상대가 많이 불안해할 수 있어.'] },
      { label: '아니오', score: 'mirror',
        reactions: ['빨리 풀고 싶어지는 편이구나.', '먼저 다가가더라도 편한 게 낫다는 마음, 이해해.'] },
    ],
  },
  {
    q: '인연이면 자연스럽게 이어지겠지, 흐름에 맡기는 편이야?',
    options: [
      { label: '예', score: 'romantic',
        reactions: ['흐름에 맡기는 낭만이 있구나.', '그 마음 예쁜데, 가끔 중요한 순간을 놓칠 수 있어.'] },
      { label: '아니오', score: 'rescuer',
        reactions: ['흐름에 맡기기보다 직접 만들어가는 편이구나.', '관계를 소중히 여기는 마음이 그렇게 나오는 거야.'] },
    ],
  },
  {
    q: '감정이 생기면 망설이지 않고 표현하는 편이야?',
    options: [
      { label: '예', score: 'hunter',
        reactions: ['망설임 없이 표현하는 편이구나.', '그런 사람이 나중에 후회도 덜 하더라.'] },
      { label: '아니오', score: 'keeper',
        reactions: ['표현을 잘 못 하는 편이구나.', '말은 못 해도 마음속으론 다 느끼고 있지?'] },
    ],
  },
]
