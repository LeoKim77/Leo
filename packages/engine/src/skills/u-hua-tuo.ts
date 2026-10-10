// 마비산 · 고유 전법 · 지휘 100%
// 원문: 턴 종료 시, 병력이 가장 낮은 우군 단일 목표가 받는 피해가 16% 감소하며(지력의 영향 받음), 1턴 동안 해당 목표에게 정신 회복을(를) 부여한다. 또한 해당 목표의 병력을 회복시킨다(치유율 240%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-hua-tuo",
  name: "마비산",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "정신 회복 1턴(예전 2턴)"
    }
  ],
  clauses: [
    {
      "text": "턴 종료 시, 병력이 가장 낮은 우군 단일 목표가 받는 피해가 16% 감소하며(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "1턴 동안 해당 목표에게 정신 회복을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "또한 해당 목표의 병력을 회복시킨다(치유율 240%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_15",
    "legacyName": "마비산",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "턴 종료 시, 병력이 가장 낮은 아군 단일 목표가 받는 피해가 8%→16% 감소하며(지력의 영향 받음), 1턴 동안 해당 목표에게 정신 회복을(를) 부여한다. 또한 해당 목표의 병력을 회복시킨다(치유율 120%→240%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.2,
          "max": 2.4
        }
      ],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.08,
          "max": -0.16,
          "duration": 1,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "lowest_hp_ally",
        "random_ally_n"
      ],
      "statusEffects": [
        {
          "name": "정신 회복",
          "duration": 1
        }
      ]
    },
    "clauses": [
      {
        "text": "턴 종료 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "병력이 가장 낮은 아군 단일 목표가 받는 피해가 8%→16% 감소",
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
        "text": "1턴 동안 해당 목표에게 정신 회복을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "해당 목표의 병력을 회복시킨다(치유율 120%→240%",
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
    // 「또한 해당 목표의 병력을 회복시킨다(치유율 240%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 120%→240%
    // 「턴 종료 시, 병력이 가장 낮은 우군 단일 목표가 받는 피해가 16% 감소하며(지력의 영향 받음)」
    c.buff(0);   // 받는피해 -8%→-16%, 1턴, 최대 1중첩
    // 「1턴 동안 해당 목표에게 정신 회복을(를) 부여한다」
    c.status(0);   // 정신 회복, 1턴
  },
});
