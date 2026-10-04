// 목우유마 · 고유 전법 · 지휘 100%
// 원문: 홀수 턴 시작 시, 전체 우군이 주는 피해가 25% 증가하며(지력의 영향 받음), 턴 종료까지 지속된다. 짝수 턴 시작 시, 전체 우군이 병력을 회복한다(치유율 220%, 지력의 영향 받음).
// 원문 절 구현: ok / note / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huang-yueying",
  name: "목우유마",
  kind: "지휘",
  isUnique: true,
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
      "status": "note"
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
      "damage": [],
      "heal": [
        {
          "min": 1.1,
          "max": 2.2
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.125,
          "max": 0.25,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "all_ally"
      ],
      "statusEffects": []
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
    // 「짝수 턴 시작 시, 전체 우군이 병력을 회복한다(치유율 220%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 110%→220%
    // 「홀수 턴 시작 시, 전체 우군이 주는 피해가 25% 증가하며(지력의 영향 받음)」
    c.buff(0);   // 주는피해 +12.5%→25%, 2턴, 최대 1중첩
  },
});
