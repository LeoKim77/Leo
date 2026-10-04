// 금성의 철벽 · 전법 · 지휘 100%
// 원문: 턴 시작 시 아군 전체가 80% 확률로 저항 1중첩(피해 1회 무효)을 얻습니다. 확률은 매 턴 12%씩 감소합니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "golden-fortress",
  name: "금성의 철벽",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 확률 80%에서 매 턴 12%p 감소, 저항은 1턴 유지로 처리",
    "source": "authored"
  },
  clauses: [
    {
      "text": "턴 시작 시 아군 전체가 80% 확률로 저항 1중첩(피해 1회 무효)을 얻습니다",
      "status": "ok"
    },
    {
      "text": "확률은 매 턴 12%씩 감소합니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.8,
          "duration": 1,
          "turnCond": {
            "turns": [
              1
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.68,
          "duration": 1,
          "turnCond": {
            "turns": [
              2
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.56,
          "duration": 1,
          "turnCond": {
            "turns": [
              3
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.44,
          "duration": 1,
          "turnCond": {
            "turns": [
              4
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.32,
          "duration": 1,
          "turnCond": {
            "turns": [
              5
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.2,
          "duration": 1,
          "turnCond": {
            "turns": [
              6
            ]
          }
        },
        {
          "name": "저항",
          "target": "all_ally",
          "chance": 0.08,
          "duration": 1,
          "turnCond": {
            "turns": [
              7
            ]
          }
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 확률 80%에서 매 턴 12%p 감소, 저항은 1턴 유지로 처리",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 저항, 대상 all_ally, 확률 80%, 1턴
    c.status(1);   // 저항, 대상 all_ally, 확률 68%, 1턴
    c.status(2);   // 저항, 대상 all_ally, 확률 56%, 1턴
    c.status(3);   // 저항, 대상 all_ally, 확률 44%, 1턴
    c.status(4);   // 저항, 대상 all_ally, 확률 32%, 1턴
    c.status(5);   // 저항, 대상 all_ally, 확률 20%, 1턴
    c.status(6);   // 저항, 대상 all_ally, 확률 8%, 1턴
  },
});
