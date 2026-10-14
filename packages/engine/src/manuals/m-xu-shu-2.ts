// 서서 금병법〈문공〉 · ok
// 원문: 고유 전법 겸손한 자세가 주는 병기 피해가 책략 피해로 변환되고 해당 전법의 피해가 10% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-shu-2",
  generalId: "xu-shu",
  name: "문공",
  status: "ok",
  note: "겸손한 자세 병기 피해 → 책략, 전법 피해 +10%",
  clauses: [
    {
      "text": "고유 전법 겸손한 자세가 주는 병기 피해가 책략 피해로 변환되고 해당 전법의 피해가 10% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "effects.damage.1.dmgType": "책략",
      "effects.damage.1.min": 2.42,
      "effects.damage.1.max": 2.42,
      "effects.damage.0.min": 2.42,
      "effects.damage.0.max": 2.42
    }
  },
});
