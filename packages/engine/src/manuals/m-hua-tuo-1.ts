// 화타 금병법〈청낭경〉 · ok
// 원문: 목표에게 치유 효과를 부여하고, 목표가 주는 피해가 6% 증가하며, 2턴 지속되고, 최대 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-hua-tuo-1",
  generalId: "hua-tuo",
  name: "청낭경",
  status: "ok",
  note: "화타가 회복시킨 목표마다 주는 피해 +6%(2턴, 최대 2중첩)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "회복 이벤트(FEAT-025)로 구현: 화타가 회복시킨 목표의 주는 피해 +6% 2턴, 2중첩"
    }
  ],
  clauses: [
    {
      "text": "목표에게 치유 효과를 부여하고",
      "status": "ok"
    },
    {
      "text": "목표가 주는 피해가 6% 증가하며",
      "status": "ok"
    },
    {
      "text": "2턴 지속되고",
      "status": "ok"
    },
    {
      "text": "최대 2회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "heal",
          "role": "self",
          "chance": 1
        },
        "effects": {
          "buffs": [
            {
              "stat": "주는피해",
              "min": 0.06,
              "max": 0.06,
              "target": "trigger_target",
              "duration": 2,
              "maxStacks": 2
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 heal
    (c) => {
      // 「목표에게 치유 효과를 부여하고, 목표가 주는 피해가 6% 증가하며, 2턴 지속되고, 최대 2회 중첩될 수 있다」
      c.buff(0);
    },
  ],
});
