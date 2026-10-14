// 육손 금병법〈분량〉 · ok
// 원문: 전투 시작 후 첫 3턴 동안 전체 아군이 화공을 부여하면 50% 확률로 추가로 목표에게 2턴 동안 지속되는 군량 고갈을 부여한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lu-xun-1",
  generalId: "lu-xun",
  name: "분량",
  status: "ok",
  note: "우리 편이 적에게 화공을 부여할 때마다 50% 판정(1~3턴)",
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안 전체 아군이 화공을 부여하면 50% 확률로 추가로 목표에게 2턴 동안 지속되는 군량 고갈을 부여한다",
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
              "name": "군량 고갈",
              "target": "trigger_target",
              "duration": 2
            }
          ],
          "targets": []
        },
        "trigger": {
          "event": "debuff",
          "role": "ally_side",
          "statusName": "화공",
          "chance": 0.5,
          "maxPerTurn": 9
        },
        "onlyTurns": [
          1,
          2,
          3
        ]
      }
    ]
  },
  runs: [
    // parts[0] — 계기 debuff
    (c) => {
      c.status(0);   // 군량 고갈, 대상 trigger_target, 2턴
    },
  ],
});
