// 여포 금병법〈도발〉 · ok
// 원문: 받는 병기 피해가 7% 감소하며, 2번째 턴 시작 시 무력이 가장 높은 적군 단일 목표와 서로 1회 공격한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lü-bu-1",
  generalId: "lü-bu",
  name: "도발",
  status: "ok",
  clauses: [
    {
      "text": "받는 병기 피해가 7% 감소하며",
      "status": "ok"
    },
    {
      "text": "2번째 턴 시작 시 무력이 가장 높은 적군 단일 목표와 서로 1회 공격한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [
            {
              "dmgType": "병기",
              "min": 1,
              "max": 1,
              "target": "highest_power_enemy",
              "reciprocal": true,
              "asBasicAttack": true
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnStart",
        "onlyTurns": [
          2
        ]
      }
    ],
    "static": {
      "mods": {
        "받는병기피해": -0.07
      }
    }
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.damage(0);   // 병기 100%, 대상 highest_power_enemy
    },
  ],
});
