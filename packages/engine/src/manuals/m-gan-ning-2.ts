// 감녕 금병법〈겁술〉 · ok
// 원문: 추격 전법을 발동할 수 없으며, 턴 종료 시, 30% 확률로 병력이 가장 낮은 적군 단일 목표에게 추가로 일반 공격을 1회 시전한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-gan-ning-2",
  generalId: "gan-ning",
  name: "겁술",
  status: "ok",
  clauses: [
    {
      "text": "추격 전법을 발동할 수 없으며",
      "status": "ok"
    },
    {
      "text": "턴 종료 시, 30% 확률로 병력이 가장 낮은 적군 단일 목표에게 추가로 일반 공격을 1회 시전한다",
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
              "target": "lowest_hp_enemy",
              "asBasicAttack": true,
              "chance": 0.3
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnEnd"
      }
    ],
    "static": {
      "mods": {
        "추격발동률": -1
      }
    }
  },
  runs: [
    // parts[0] — 시점 turnEnd
    (c) => {
      c.damage(0);   // 병기 100%, 대상 lowest_hp_enemy, 확률 30%
    },
  ],
});
