// 전쟁 종식 · 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안 전체 아군이 턴 시작 시 65% 확률로 방어 1스택을 획득한다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "forge-armor",
  name: "전쟁 종식",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안 전체 아군이 턴 시작 시 65% 확률로 방어 1스택을 획득한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_11",
    "legacyName": "전쟁 종식",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 후 첫 3턴 동안 전체 아군이 턴 시작 시 32.5%→65% 확률로 방어 1스택을 획득한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "all_ally",
          "chance": 0.65,
          "turnCond": {
            "maxTurn": 3
          }
        }
      ],
      "targets": []
    },
    "manualOverride": true,
    "onlyTurns": [
      1,
      2,
      3
    ],
    "preciseApplied": true,
    "clauses": [
      {
        "text": "전투 시작 후 첫 3턴 동안 전체 아군이 턴 시작 시 32.5%→65% 확률로 방어 1스택을 획득한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전투 시작 후 첫 3턴 동안 전체 아군이 턴 시작 시 65% 확률로 방어 1스택을 획득한다」
    c.status(0);   // 방어, 대상 all_ally, 확률 65%
  },
});
