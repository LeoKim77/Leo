// 노숙 금병법〈치국론〉 · ok
// 원문: 받는 피해가 7% 감소하며, 매 턴 액티브 전법 첫 발동 후, 랜덤 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을 부여한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lu-su-1",
  generalId: "lu-su",
  name: "치국론",
  status: "ok",
  clauses: [
    {
      "text": "받는 피해가 7% 감소하며",
      "status": "ok"
    },
    {
      "text": "매 턴 액티브 전법 첫 발동 후, 랜덤 적군 단일 목표에게 2턴 동안 지속되는 군량 고갈을 부여한다",
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
          "maxPerTurn": 1
        }
      }
    ],
    "static": {
      "mods": {
        "받는피해": -0.07
      }
    }
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.status(0);   // 군량 고갈, 대상 random_enemy_1, 2턴
    },
  ],
});
