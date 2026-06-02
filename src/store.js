const K = { user: 'ltt_user', scores: 'ltt_scores', result: 'ltt_result', qindex: 'ltt_qi', answers: 'ltt_ans' }

export const INIT_SCORES = {
  keeper:0, hunter:0, cool:0, grandma:0, romantic:0, analyst:0, mirror:0, rescuer:0, ghost:0
}

const get = (k, fallback) => {
  try { return JSON.parse(sessionStorage.getItem(k)) ?? fallback } catch { return fallback }
}
const set = (k, v) => sessionStorage.setItem(k, JSON.stringify(v))

export const store = {
  getUser:    ()  => get(K.user, null),
  setUser:    (u) => set(K.user, u),
  getScores:  ()  => get(K.scores, { ...INIT_SCORES }),
  setScores:  (s) => set(K.scores, s),
  getResult:  ()  => get(K.result, null),
  setResult:  (r) => set(K.result, r),   // { first:'keeper', second:'hunter', third:'cool' }
  getQIndex:  ()  => get(K.qindex, 0),
  setQIndex:  (i) => set(K.qindex, i),
  getAnswers: ()  => get(K.answers, []),
  setAnswers: (a) => set(K.answers, a),
  clear: () => Object.values(K).forEach(k => sessionStorage.removeItem(k)),
}
