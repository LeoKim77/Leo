// 주유 금병법〈화계〉 · ok
// 원문: 적군이 화공 상태를 부여 받을 경우, 35% 확률로 '기지' 효과 발동(턴당 최대 2회 발동, 고유 전법 기지의 승리-기지 발동 횟수와 개별적으로 계산)
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhou-yu-1",
  generalId: "zhou-yu",
  name: "화계",
  status: "ok",
  note: "적군이 화공을 받을 때마다 35% 확률로 기지(랜덤 적군 2명 60% 책략), 턴당 최대 2회(기지의 승리 횟수와 별도)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "기지 효과 = 기지의 승리 기지(랜덤 적군 2명 60% 책략)와 같음, 턴당 2회·별도 횟수 — 원문대로"
    }
  ],
  clauses: [
    {
      "text": "적군이 화공 상태를 부여 받을 경우, 35% 확률로 '기지' 효과 발동(턴당 최대 2회 발동, 고유 전법 기지의 승리-기지 발동 횟수와 개별적으로 계산)",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 0.6,
              "max": 0.6,
              "target": "random_enemy_n"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "debuff",
          "role": "ally_side",
          "statusName": "화공",
          "chance": 0.35,
          "maxPerTurn": 2
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 debuff
    (c) => {
      c.damage(0);   // 책략 60%, 대상 random_enemy_n
    },
  ],
});
