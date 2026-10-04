// 유현정책 · 전법 · 액티브 60%
// 원문: 랜덤 우군 2명이 주는 피해가 15%, 통솔이 25 상승합니다. 2턴 지속됩니다.
// 원문 절 구현: ok / ok / ok
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
  clauses: [
    {
      "text": "랜덤 우군 2명이 주는 피해가 15%",
      "status": "ok"
    },
    {
      "text": "통솔이 25 상승합니다",
      "status": "ok"
    },
    {
      "text": "2턴 지속됩니다",
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
    // (원문 절 매핑 없음)
    c.statMod(0);   // 통솔 25, 대상 random_ally_n, 2턴, 최대 1중첩
    c.buff(0);   // 주는피해 +15%, 대상 tag:t, 2턴, 최대 1중첩
  },
});
