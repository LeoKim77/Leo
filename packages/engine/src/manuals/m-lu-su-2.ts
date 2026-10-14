// 노숙 금병법〈탑상책〉 · ok
// 원문: 매 턴 전체 아군이 액티브 전법 첫 발동 후, 랜덤 적군 단일 목표가 받는 책략 피해가 4% 증가하며, 1턴 지속되고, 3회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lu-su-2",
  generalId: "lu-su",
  name: "탑상책",
  status: "ok",
  clauses: [
    {
      "text": "매 턴 전체 아군이 액티브 전법 첫 발동 후",
      "status": "ok"
    },
    {
      "text": "랜덤 적군 단일 목표가 받는 책략 피해가 4% 증가하며",
      "status": "ok"
    },
    {
      "text": "1턴 지속되고",
      "status": "ok"
    },
    {
      "text": "3회 중첩될 수 있다",
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
              "stat": "받는책략피해",
              "min": 0.04,
              "max": 0.04,
              "target": "random_enemy_1",
              "duration": 1,
              "maxStacks": 3
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "role": "ally_side",
          "chance": 1,
          "maxPerTurn": 1
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.buff(0);   // 받는책략피해 +4%, 대상 random_enemy_1, 1턴, 최대 3중첩
    },
  ],
});
