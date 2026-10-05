// 훗날의 교훈 · 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 적군 무작위 2명에게 90%의 책략 피해를 입힙니다(추가로 아군 전체의 누적 치료량의 영향을 받음). 매 턴 종료 시, 아군 전열의 병력을 회복합니다. 치료율: 50%(지력의 영향을 받음).
// 원문 절 구현: missing / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "punish-past",
  name: "훗날의 교훈",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "\"누적 치료량 영향\" 미반영. 전열 회복은 전열 아군 1명(전열 우선)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "턴 종료 회복 대상: 전열 아군 전체 (예전엔 전열 1명)"
    }
  ],
  clauses: [
    {
      "text": "매 턴 시작 시, 적군 무작위 2명에게 90%의 책략 피해를 입힙니다(추가로 아군 전체의 누적 치료량의 영향을 받음)",
      "status": "missing"
    },
    {
      "text": "매 턴 종료 시, 아군 전열의 병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율: 50%(지력의 영향을 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.9,
          "max": 0.9,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 0.5,
              "max": 0.5,
              "target": "front_allies"
            }
          ],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"누적 치료량 영향\" 미반영. 전열 회복은 전열 아군 1명(전열 우선)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 90%, 대상 random_enemy_n
  },
});
