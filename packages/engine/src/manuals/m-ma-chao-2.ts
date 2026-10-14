// 마초 금병법〈마술〉 · ok
// 원문: 회심 피해가 15% 증가하고, 고유 전법-기병 돌격의 척살의 피해가 180% 증가한다. 단, 척살은 매턴 1회만 발동한다.
// 원문 절 구현: ok / ok / note / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-ma-chao-2",
  generalId: "ma-chao",
  name: "마술",
  status: "ok",
  note: "기병 돌격의 척살 피해 60% × (1+1.8) = 168%(R-047), 척살은 매 턴 1회",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — '척살 피해 180% 증가'(×2.8 해석)만 근사"
    },
    {
      "date": "2026-10-05",
      "note": "R-047: 피해 계수 변경은 곱연산 — 척살 60% × 2.8 = 168% 확정"
    }
  ],
  clauses: [
    {
      "text": "회심 피해가 15% 증가하고",
      "status": "ok"
    },
    {
      "text": "고유 전법-기병 돌격의 척살의 피해가 180% 증가한다",
      "status": "ok"
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
