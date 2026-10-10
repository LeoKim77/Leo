// 허점 공략 · 전법 · 지휘 100%
// 원문: 전투 시작 후 4턴 동안 자신과 랜덤 우군 단일 목표가 받는 피해가 26% 감소한다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "avoid-edge",
  name: "허점 공략",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "전투 시작 후 4턴 동안 자신과 랜덤 우군 단일 목표가 받는 피해가 26% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_10",
    "legacyName": "허점 공략",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 후 4턴 동안 자신과 랜덤 우군 단일 목표가 받는 피해가 13%→26% 감소한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.13,
          "max": -0.26,
          "duration": 4,
          "maxStacks": 1,
          "target": "self_and_random_ally_1"
        }
      ],
      "statMods": [],
      "targets": [
        "random_ally_n",
        "random_ally_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "전투 시작 후 4턴 동안 자신과 랜덤 우군 단일 목표가 받는 피해가 13%→26% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "공용 규칙 R-028 대상 정리 (자신과 우군 혼합 대상 점검)",
      "reason": "'자신과 랜덤 우군 단일 목표' — 대상 코드에 self 가 섞여 버프가 자신에게만 걸리던 것을 자신 + 자신 뺀 우군 1명으로"
    }
  },
  run(c) {
    // 「전투 시작 후 4턴 동안 자신과 랜덤 우군 단일 목표가 받는 피해가 26% 감소한다」
    c.buff(0);   // 받는피해 -13%→-26%, 대상 self_and_random_ally_1, 4턴, 최대 1중첩
  },
});
