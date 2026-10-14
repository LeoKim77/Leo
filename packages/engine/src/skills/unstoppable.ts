// 예리한 통찰 · 전법 · 패시브 100%
// 원문: 자신의 방어 관통이(가) 16%, 주는 피해가 35% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "unstoppable",
  name: "예리한 통찰",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "자신의 방어 관통이(가) 16%",
      "status": "ok"
    },
    {
      "text": "주는 피해가 35% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_68",
    "legacyName": "예리한 통찰",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 방어 관통이(가) 8%→16%, 주는 피해가 17.5%→35% 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.175,
          "max": 0.35,
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "방어관통",
          "min": 0.08,
          "max": 0.16,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "자신의 방어 관통이(가) 8%→16%",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "주는 피해가 17.5%→35% 증가한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「주는 피해가 35% 증가한다」
    c.buff(0);   // 주는피해 +17.5%→35%, 전투 종료까지, 최대 1중첩
    c.buff(1);   // 방어관통 +8%→16%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
