// 비상 · 고유 전법 · 액티브 65%
// 원문: 적군 전체에게 110%의 책략 피해를 주며, 2턴 동안 자신의 간파이(가) 10% 증가한다, 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhong-yao",
  name: "비상",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "적군 전체에게 110%의 책략 피해를 주며",
      "status": "ok"
    },
    {
      "text": "2턴 동안 자신의 간파이(가) 10% 증가한다",
      "status": "ok"
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 1.1,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "간파",
          "min": 0.1,
          "max": 0.1,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「적군 전체에게 110%의 책략 피해를 주며」
    c.damage(0);
    // 「2턴 동안 자신의 간파이(가) 10% 증가한다, 2회 중첩될 수 있다」
    c.buff(0);
  },
});
