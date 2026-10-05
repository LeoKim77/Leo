// 마초 금병법〈마술〉 · approx
// 원문: 회심 피해가 15% 증가하고, 고유 전법-기병 돌격의 척살의 피해가 180% 증가한다. 단, 척살은 매턴 1회만 발동한다.
// 원문 절 구현: ok / approx / note / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-ma-chao-2",
  generalId: "ma-chao",
  name: "마술",
  status: "approx",
  note: "기병 돌격의 척살 피해 +180%(계수 ×2.8), 척살은 매 턴 1회",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — '척살 피해 180% 증가'(×2.8 해석)만 근사"
    }
  ],
  clauses: [
    {
      "text": "회심 피해가 15% 증가하고",
      "status": "ok"
    },
    {
      "text": "고유 전법-기병 돌격의 척살의 피해가 180% 증가한다",
      "status": "approx"
    },
    {
      "text": "단",
      "status": "note"
    },
    {
      "text": "척살은 매턴 1회만 발동한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "회심피해": 0.15
      }
    },
    "uniquePatch": {
      "effects.damage.0.min": 1.68,
      "effects.damage.0.max": 1.68,
      "trigger.maxPerTurn": 1
    }
  },
});
