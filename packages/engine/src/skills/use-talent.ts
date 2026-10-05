// 적재적소 · 전법 · 액티브 75%
// 원문: 지력이 가장 높은 우군 1명이 받는 피해를 25% 감소시켜 2턴 지속시키고(지력 영향), 저항 1중첩(피해 1회 무효)을 부여합니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "use-talent",
  name: "적재적소",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "지력 영향 반영",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "지력 영향 반영"
    }
  ],
  clauses: [
    {
      "text": "지력이 가장 높은 우군 1명이 받는 피해를 25% 감소시켜 2턴 지속시키고(지력 영향)",
      "status": "ok"
    },
    {
      "text": "저항 1중첩(피해 1회 무효)을 부여합니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_intel_ally",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "저항",
          "target": "highest_intel_ally",
          "duration": 99
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "지력 영향 반영 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -25%, 대상 highest_intel_ally, 2턴, 최대 1중첩
    c.status(0);   // 저항, 대상 highest_intel_ally, 99턴
  },
});
