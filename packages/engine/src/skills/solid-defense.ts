// 난공불락 · 전법 · 지휘 100%
// 원문: 자신의 통솔이 15% 상승합니다. 2턴부터 매 턴 시작 시 60% 확률로 랜덤 적군 2~3명을 도발하며 2턴 지속됩니다(통솔 영향).
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "solid-defense",
  name: "난공불락",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "\"도발\"=조롱. 2턴부터 매 턴 시작 60% 판정 1번 → 성공 시 랜덤 적군 2~3명 전원 조롱(R-021, R-020). 통솔 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신의 통솔이 15% 상승합니다",
      "status": "ok"
    },
    {
      "text": "2턴부터 매 턴 시작 시 60% 확률로 랜덤 적군 2~3명을 도발하며 2턴 지속됩니다(통솔 영향)",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "turnStart",
    "onlyTurns": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "조롱",
          "target": "random_enemy_2to3",
          "chance": 0.6,
          "duration": 2,
          "chanceOnce": true
        }
      ],
      "targets": []
    },
    "static": {
      "statsPct": {
        "통솔": 0.15
      }
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"도발\"=조롱. 2턴부터 매 턴 시작 60% 판정 1번 → 성공 시 랜덤 적군 2~3명 전원 조롱(R-021, R-020). 통솔 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 조롱, 대상 random_enemy_2to3, 확률 60%(1회 판정), 2턴
  },
});
