import { PALETTE } from "./tokens";

export const TYPES = {
  keeper: {
    key: "keeper",
    emoji: "🛡️",
    name: "오징어 지킴이형",
    tagline: "내 사람은 내가 지킨다, 독점욕 만렙",
    desc: "한번 마음 주면 끝까지 가는 타입. 표현은 서툴러도 진심은 누구보다 깊어요.",
    color: PALETTE.coral,
  },
  hunter: {
    key: "hunter",
    emoji: "🎯",
    name: "직진 사냥꾼형",
    tagline: "좋으면 바로 들이대는 돌격대장",
    desc: "재고 따지는 거 질색. 마음이 동하면 그 자리에서 표현하는 솔직 끝판왕이에요.",
    color: PALETTE.amber,
  },
  cool: {
    key: "cool",
    emoji: "🧊",
    name: "쿨한 척 고수형",
    tagline: "겉은 시크, 속은 활활",
    desc: "관심 없는 척하지만 사실 누구보다 신경 쓰는 타입. 밀당은 타고났어요.",
    color: PALETTE.green,
  },
  grandma: {
    key: "grandma",
    emoji: "🧶",
    name: "그랜마에라형",
    tagline: "연애보다 내 평화가 우선",
    desc: "혼자가 편하고 감정 소모는 사절. 설렘보다 안정과 내 시간을 더 사랑해요.",
    color: PALETTE.greenDeep,
  },
};
