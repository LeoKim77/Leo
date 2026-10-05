// 장비 금병법〈신정후도명〉 · ok
// 원문: 고유 전법 만인의 적 발동률이 100% 증가하고, 위협 시전 확률이 12%로 감소하며, 주는 병기 피해 계수가 35% 감소한다.
// 원문 절 구현: ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-fei-1",
  generalId: "zhang-fei",
  name: "신정후도명",
  status: "ok",
  note: "만인의 적 발동률 +100%, 위협 확률 12%, 피해 계수 140%×0.65",
  clauses: [
    {
      "text": "고유 전법 만인의 적 발동률이 100% 증가하고",
      "status": "ok"
    },
    {
      "text": "위협 시전 확률이 12%로 감소하며",
      "status": "ok"
    },
    {
      "text": "주는 병기 피해 계수가 35% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "unit": {
      "uniqueProcAdd": 1
    },
    "uniquePatch": {
      "effects.statusEffects.0.chance": 0.12,
      "effects.damage.0.min": 0.91,
      "effects.damage.0.max": 0.91
    }
  },
});
