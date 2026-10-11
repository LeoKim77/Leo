// 유현정책 · 전법 · 액티브 60%
// 원문(녹화 2026-10-11): 2턴 동안 랜덤 아군 2명의 주는 피해가 15%, 통솔이 25포인트 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "know-people",
  name: "유현정책",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 전법 녹화 원문(10레벨)으로 교체: 랜덤 아군 2명(자신 포함)"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 랜덤 아군 2명의 주는 피해가 15%",
      "status": "ok"
    },
    {
      "text": "통솔이 25포인트 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.15,
          "max": 0.15,
          "target": "tag:t",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [
        {
          "stat": "통솔",
          "min": 25,
          "max": 25,
          "target": "random_ally_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "t"
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // 「2턴 동안 랜덤 아군 2명의 주는 피해가 15%」「통솔이 25포인트 증가한다」 — 아군 = 자신 포함(random_ally_n), 같은 2명
    c.statMod(0);   // 통솔 25, 대상 random_ally_n(tag t), 2턴
    c.buff(0);   // 주는피해 +15%, 대상 tag:t, 2턴
  },
});
