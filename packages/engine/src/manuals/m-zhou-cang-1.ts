// 주창 금병법〈충렬〉 · ok
// 원문: 통솔이 15포인트 증가하고, 고유 전법 충성과 용맹이 부여하는 이상 상태 확률이 20% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhou-cang-1",
  generalId: "zhou-cang",
  name: "충렬",
  status: "ok",
  note: "이상 상태 확률 45% → 65%(+20%p로 해석)",
  clauses: [
    {
      "text": "통솔이 15포인트 증가하고",
      "status": "ok"
    },
    {
      "text": "고유 전법 충성과 용맹이 부여하는 이상 상태 확률이 20% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "stats": {
        "통솔": 15
      }
    },
    "uniquePatch": {
      "effects.statusEffects.0.chance": 0.65,
      "effects.statusEffects.1.chance": 0.65
    }
  },
});
