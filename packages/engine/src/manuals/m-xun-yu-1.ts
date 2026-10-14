// 순욱 금병법〈북한〉 · ok
// 원문: 지력이 가장 높은 아군 단일 목표의 묘책 확률이 6% 증가하며, 묘책 피해가 10% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xun-yu-1",
  generalId: "xun-yu",
  name: "북한",
  status: "ok",
  note: "지력 최고 아군 1명 묘책 확률 +6%, 묘책 피해 +10%",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 묘책 피해 증가는 회심 피해(공용)로 근사"
    },
    {
      "date": "2026-10-05",
      "note": "R-048 회심·묘책 피해 분리 — 묘책 피해 +10% 를 묘책피해로(예전 회심/묘책 공용 근사)"
    }
  ],
  clauses: [
    {
      "text": "지력이 가장 높은 아군 단일 목표의 묘책 확률이 6% 증가하며",
      "status": "ok"
    },
    {
      "text": "묘책 피해가 10% 증가한다",
      "status": "ok"
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
              "stat": "묘책피해",
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
