import { T } from "../constants/tokens";

export const globalCss = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  .fade-in { animation: fadeIn .35s ease both; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .option-btn { transition: transform .12s ease, border-color .12s ease, background .12s ease; }
  .option-btn:hover { border-color: ${T.green} !important; background: ${T.greenSoft} !important; }
  .option-btn:active { transform: scale(.98); }
  input:focus { outline: none; border-color: ${T.green} !important; }
`;
