// 손책 금병법〈무구〉 · ok
// 원문: 액티브 전법 발동 후, 40% 확률(무력의 영향을 받음)로 랜덤 적군 단일 목표에게 2턴 동안 지속되는 위협을 부여한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-ce-2",
  generalId: "sun-ce",
  name: "무구",
  status: "ok",
  note: "액티브 발동 후 40%×무력 영향 확률로 랜덤 적 1명 위협 2턴(엑셀의 공포는 오기)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "40% 확률에 무력 영향(c.infl) 반영"
    }
  ],
  clauses: [
    {
      "text": "액티브 전법 발동 후, 40% 확률(무력의 영향을 받음)로 랜덤 적군 단일 목표에게 2턴 동안 지속되는 위협을 부여한다",
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
          "statusEffects": [
            {
              "name": "위협",
              "target": "random_enemy_1",
              "duration": 2
            }
          ],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "role": "self",
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      // 「액티브 전법 발동 후, 40% 확률(무력의 영향을 받음)로 랜덤 적군 단일 목표에게 2턴 동안 지속되는 위협을 부여한다」
      if (c.chance(0.4 * c.infl('무력'))) c.status(0);
    },
  ],
});
