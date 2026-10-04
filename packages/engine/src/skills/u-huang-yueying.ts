// 목우유마 · 고유 전법 · 지휘 100%
// 원문: 홀수 턴 시작 시, 전체 우군이 주는 피해가 25% 증가하며(지력의 영향 받음), 턴 종료까지 지속된다. 짝수 턴 시작 시, 전체 우군이 병력을 회복한다(치유율 220%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huang-yueying",
  name: "목우유마",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "홀수 턴: 주는 피해 +25%(지력 영향) 턴 종료까지 / 짝수 턴: 회복 — 예전엔 홀짝 구분 없이 매 턴 둘 다"
    }
  ],
  clauses: [
    {
      "text": "홀수 턴 시작 시, 전체 우군이 주는 피해가 25% 증가하며(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "턴 종료까지 지속된다",
      "status": "ok"
    },
    {
      "text": "짝수 턴 시작 시, 전체 우군이 병력을 회복한다(치유율 220%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_27",
    "legacyName": "목우유마",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "홀수 턴 시작 시, 전체 아군이 주는 피해가 12.5%→25% 증가하며(지력의 영향 받음), 턴 종료까지 지속된다. 짝수 턴 시작 시, 전체 아군이 병력을 회복한다(치유율 110%→220%, 지력의 영향 받음).",
    "effects": {
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.125,
          "max": 0.25,
          "target": "all_ally",
          "untilTurnEnd": true,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ],
      "heal": [
        {
          "min": 1.1,
          "max": 2.2,
          "target": "all_ally",
          "turnCond": {
            "parity": "even"
          }
        }
      ],
      "targets": [
        "all_ally"
      ]
    },
    "clauses": [
      {
        "text": "홀수 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군이 주는 피해가 12.5%→25% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "(지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "턴 종료까지 지속된다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "짝수 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군이 병력을 회복한다(치유율 110%→220%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「홀수 턴 시작 시, 전체 우군이 주는 피해가 25% 증가하며(지력의 영향 받음)」
    // 「턴 종료까지 지속된다」
    c.buff(0);
    // 「짝수 턴 시작 시, 전체 우군이 병력을 회복한다(치유율 220%, 지력의 영향 받음)」
    c.heal(0);
  },
});
