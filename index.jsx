import React, { useState } from "react";
import { QUESTIONS } from "./constants/questions";
import { TYPES } from "./constants/types";
import { globalCss } from "./styles/global";
import { styles } from "./styles/styles";
import Intro from "./components/Intro";
import Quiz from "./components/Quiz";
import Result from "./components/Result";
import Done from "./components/Done";

export default function LoveTypeTest() {
  const [step, setStep] = useState("intro"); // intro | quiz | result | done
  const [user, setUser] = useState({ name: "", phone: "", interest: "사주 연애 상담", gender: "" });
  const [qIndex, setQIndex] = useState(0);
  const [scores, setScores] = useState({ keeper: 0, hunter: 0, cool: 0, grandma: 0 });
  const [resultType, setResultType] = useState(null);

  const computeResult = (finalScores) => {
    let best = "keeper";
    let max = -1;
    Object.entries(finalScores).forEach(([k, v]) => {
      if (v > max) { max = v; best = k; }
    });
    return TYPES[best];
  };

  const handleAnswer = (scoreKey) => {
    const next = { ...scores, [scoreKey]: scores[scoreKey] + 1 };
    setScores(next);
    if (qIndex + 1 < QUESTIONS.length) {
      setQIndex(qIndex + 1);
    } else {
      setResultType(computeResult(next));
      setStep("result");
    }
  };

  const resetAll = () => {
    setStep("intro");
    setUser({ name: "", phone: "", interest: "사주 연애 상담" });
    setQIndex(0);
    setScores({ keeper: 0, hunter: 0, cool: 0, grandma: 0 });
    setResultType(null);
  };

  return (
    <div style={styles.viewport}>
      <style>{globalCss}</style>
      <div style={styles.phone}>
        {step === "intro" && <Intro user={user} setUser={setUser} onStart={() => setStep("quiz")} />}
        {step === "quiz" && (
          <Quiz q={QUESTIONS[qIndex]} index={qIndex} total={QUESTIONS.length} onAnswer={handleAnswer} />
        )}
        {step === "result" && (
          <Result type={resultType} user={user} onApply={() => setStep("done")} />
        )}
        {step === "done" && <Done type={resultType} user={user} onReset={resetAll} />}
      </div>
    </div>
  );
}
