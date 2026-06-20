// options[0]=왼쪽 버튼, options[1]=오른쪽 버튼
export const QUESTIONS = [
  {
    q: '썸 탈 때 답장이 평소보다 조금 늦으면?',
    options: [
      { label: '이유가 먼저 생각나', score: 'keeper',
        reactions: ['머릿속이 바빠지는 편이구나.'] },
      { label: '기다릴 수 있어', score: 'grandma',
        reactions: ['그 여유 생각보다 쉽지 않거든.'] },
    ],
  },
  {
    q: '좋아하는 사람이 생기면 내가 먼저 연락할 수 있어?',
    options: [
      { label: '예', score: 'hunter',
        reactions: [] },
      { label: '아니오', score: 'cool',
        reactions: [] },
    ],
  },
  {
    q: '썸 탈 때 상대 말투나 이모티콘이 달라지면?',
    options: [
      { label: '바로 알아채', score: 'analyst',
        reactions: ['촉이 꽤 예리한 편이구나.'] },
      { label: '크게 신경 안 써', score: 'romantic',
        reactions: ['전체 분위기로 받아들이는 편이구나.'] },
    ],
  },
  {
    q: '썸 상대가 힘들다고 하면, 나도 같이 힘들어지는 편이야?',
    options: [
      { label: '예', score: 'mirror',
        reactions: [] },
      { label: '아니오', score: 'ghost',
        reactions: [] },
    ],
  },
  {
    q: '썸 상대가 힘든 상황일 때, 어떻게 하고 싶어?',
    options: [
      { label: '어떻게든 해결해줘야 해', score: 'rescuer',
        reactions: ['책임감이 강한 편이구나.'] },
      { label: '그냥 옆에 있어줄래', score: 'keeper',
        reactions: ['그런 마음, 상대한테 생각보다 크게 닿거든.'] },
    ],
  },
  {
    q: '하루 연락이 없어도 그냥 기다릴 수 있는 편이야?',
    options: [
      { label: '예', score: 'grandma',
        reactions: [] },
      { label: '아니오', score: 'hunter',
        reactions: [] },
    ],
  },
  {
    q: '좋아하는 사람한테 티를 낼 때 더 가까운 쪽은?',
    options: [
      { label: '상대 먼저 움직이길 기다려', score: 'cool',
        reactions: ['안 그런 척하면서도 신경 쓰이지 않아?'] },
      { label: '내가 어떻게 할지 먼저 생각해', score: 'analyst',
        reactions: ['신중한 편이구나.'] },
    ],
  },
  {
    q: '썸 상대랑 어색해지면, 어떻게 돼?',
    options: [
      { label: '혼자 정리할 시간 필요해', score: 'ghost',
        reactions: ['혼자 생각 정리하는 시간이 필요한 편이구나.'] },
      { label: '내가 먼저 말 걸어서 풀어', score: 'mirror',
        reactions: [] },
    ],
  },
  {
    q: '잘 맞으면 자연스럽게 이어지겠지 하고, 흐름에 맡기는 편이야?',
    options: [
      { label: '예', score: 'romantic',
        reactions: [] },
      { label: '아니오', score: 'rescuer',
        reactions: [] },
    ],
  },
  {
    q: '마음이 생기면 어떻게 해?',
    options: [
      { label: '그냥 표현해', score: 'hunter',
        reactions: ['망설임 없이 표현하는 편이구나.'] },
      { label: '티 안 내고 기다려', score: 'cool',
        reactions: ['상대 반응 먼저 확인하고 싶은 편이구나.'] },
    ],
  },
]
