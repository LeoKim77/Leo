// 태사자 금병법〈축력〉 · ok
// 원문: 짝수 턴에 자신의 추격 전법 발동률이 15% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-taishi-ci-1",
  generalId: "taishi-ci",
  name: "축력",
  status: "ok",
  clauses: [
    {
      "text": "짝수 턴에 자신의 추격 전법 발동률이 15% 증가한다",
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
              "stat": "추격발동률",
              "min": 0.15,
              "max": 0.15,
              "target": "self",
              "duration": 1,
              "maxStacks": 1,
              "turnCond": {
                "parity": "even"
              }
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.buff(0);   // 추격발동률 +15%, 대상 self, 1턴, 최대 1중첩
    },
  ],
});
