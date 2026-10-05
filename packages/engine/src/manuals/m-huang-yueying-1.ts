// 황월영 금병법〈기관술〉 · ok
// 원문: 매 턴 시작 시, 통솔이 가장 높은 우군이 35% 확률로 적군 전체를 조롱한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-huang-yueying-1",
  generalId: "huang-yueying",
  name: "기관술",
  status: "ok",
  note: "35% 판정 1번 → 성공 시 적군 전체 조롱(R-021). 조롱 시전자 = 통솔 최고 우군(FEAT-015)",
  clauses: [
    {
      "text": "매 턴 시작 시, 통솔이 가장 높은 우군이 35% 확률로 적군 전체를 조롱한다",
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
              "name": "조롱",
              "target": "all_enemy",
              "chance": 0.35,
              "duration": 1,
              "caster": "highest_command_ally",
              "chanceOnce": true
            }
          ],
          "targets": []
        },
        "_timing": "turnStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.status(0);   // 조롱, 대상 all_enemy, 확률 35%(1회 판정), 1턴
    },
  ],
});
