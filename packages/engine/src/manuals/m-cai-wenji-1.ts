// 채문희 금병법〈호가십팔박〉 · ok
// 원문: 고유 전법 비분시 발동률이 10% 증가한다. 발동 후, 1턴 동안 랜덤 적군 2명의 지력이 30포인트 감소한다. 단, 비분시의 치유 효과가 20% 감소한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cai-wenji-1",
  generalId: "cai-wenji",
  name: "호가십팔박",
  status: "ok",
  clauses: [
    {
      "text": "고유 전법 비분시 발동률이 10% 증가한다",
      "status": "ok"
    },
    {
      "text": "발동 후, 1턴 동안 랜덤 적군 2명의 지력이 30포인트 감소한다",
      "status": "ok"
    },
    {
      "text": "단",
      "status": "ok"
    },
    {
      "text": "비분시의 치유 효과가 20% 감소한다",
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
          "statMods": [
            {
              "stat": "지력",
              "min": -30,
              "max": -30,
              "target": "random_enemy_n",
              "duration": 1,
              "maxStacks": 1
            }
          ],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "castSkill": "unique",
          "role": "self",
          "chance": 1,
          "maxPerTurn": 1
        }
      }
    ],
    "unit": {
      "uniqueProcAdd": 0.1
    },
    "uniquePatch": {
      "effects.heal.0.max": 0.96,
      "effects.heal.1.max": 0.4
    }
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.statMod(0);   // 지력 -30, 대상 random_enemy_n, 1턴, 최대 1중첩
    },
  ],
});
