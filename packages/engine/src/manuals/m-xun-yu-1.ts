// 순욱 금병법〈북한〉 · approx
// 원문: 지력이 가장 높은 아군 단일 목표의 묘책 확률이 6% 증가하며, 묘책 피해가 10% 증가한다.
// 원문 절 구현: ok / approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xun-yu-1",
  generalId: "xun-yu",
  name: "북한",
  status: "approx",
  note: "묘책 피해 +10%는 회심/묘책 공용 피해 증가로 근사",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 묘책 피해 증가는 회심 피해(공용)로 근사"
    }
  ],
  clauses: [
    {
      "text": "지력이 가장 높은 아군 단일 목표의 묘책 확률이 6% 증가하며",
      "status": "ok"
    },
    {
      "text": "묘책 피해가 10% 증가한다",
      "status": "approx"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "묘책",
              "min": 0.06,
              "max": 0.06,
              "target": "highest_intel_ally",
              "duration": 999,
              "maxStacks": 1
            },
            {
              "stat": "회심피해",
              "min": 0.1,
              "max": 0.1,
              "target": "highest_intel_ally",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "battleStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.buff(0);   // 묘책 +6%, 대상 highest_intel_ally, 전투 종료까지, 최대 1중첩
      c.buff(1);   // 회심피해 +10%, 대상 highest_intel_ally, 전투 종료까지, 최대 1중첩
    },
  ],
});
