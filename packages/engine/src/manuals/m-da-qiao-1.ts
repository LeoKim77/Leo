// 대교 금병법〈상사문부〉 · ok
// 원문: 고유 전법 국색이 디버프 상태를 부여하는 목표가 적군 전체로 바뀌며, 회복 효과는 50% 감소한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-da-qiao-1",
  generalId: "da-qiao",
  name: "상사문부",
  status: "ok",
  note: "국색 디버프 대상 → 적군 전체, 회복 -50%",
  clauses: [
    {
      "text": "고유 전법 국색이 디버프 상태를 부여하는 목표가 적군 전체로 바뀌며",
      "status": "ok"
    },
    {
      "text": "회복 효과는 50% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "effects.buffs.0.target": "all_enemy",
      "effects.heal.0.min": 0.45,
      "effects.heal.0.max": 0.9
    }
  },
});
