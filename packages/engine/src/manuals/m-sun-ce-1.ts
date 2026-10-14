// 손책 금병법〈패왕전〉 · ok
// 원문: 액티브 전법 발동 성공 후, 65% 확률로 자신의 디버프 상태 1가지를 랜덤으로 제거한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-ce-1",
  generalId: "sun-ce",
  name: "패왕전",
  status: "ok",
  clauses: [
    {
      "text": "액티브 전법 발동 성공 후, 65% 확률로 자신의 디버프 상태 1가지를 랜덤으로 제거한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": [],
          "dispel": [
            {
              "target": "self",
              "count": 1
            }
          ]
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "role": "self",
          "chance": 0.65,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.dispel(0);   // 디버프 1가지 제거, 대상 self
    },
  ],
});
