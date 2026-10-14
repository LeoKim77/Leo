// 침착한 지휘 · 고유 전법 · 패시브 100%
// 원문: 자신의 통솔이 30포인트 증가한다. 매 턴 처음 피해를 받은 후, 랜덤 적군 2명이 받는 피해가 10% 증가하며(통솔의 영향 받음), 60% 확률로 공격자에게 2턴 동안 지속되는 무장 해제 효과를 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yu-jin",
  name: "침착한 지휘",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-10",
      "note": "녹화(조조·소교·등애 상대): 받는 피해 증가 10% → 15.23%(우금 통솔 약 262) — 통솔 영향 가중치 0.32% (잠정)"
    },
    {
      "date": "2026-10-04",
      "note": "통솔 +30은 전투 시작 상시(예전엔 피격 때 2턴), 무장 해제는 '공격자'에게 2턴(예전엔 랜덤 적), 받는 피해 증가에 통솔 영향"
    }
  ],
  clauses: [
    {
      "text": "자신의 통솔이 30포인트 증가한다",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "매 턴 처음 피해를 받은 후, 랜덤 적군 2명이 받는 피해가 10% 증가하며(통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "60% 확률로 공격자에게 2턴 동안 지속되는 무장 해제 효과를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_44",
    "legacyName": "침착한 지휘",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 통솔이 15→30포인트 증가한다. 매 턴 처음 피해를 받은 후, 랜덤 적군 2명이 받는 피해가 5%→10% 증가하며(통솔의 영향 받음), 30%→60% 확률로 공격자에게 2턴 동안 지속되는 무장 해제 효과를 부여한다.",
    "effects": {
      "buffs": [
        {
          "stat": "받는피해",
          "min": 0.05,
          "max": 0.1,
          "duration": 2,
          "maxStacks": 1,
          "target": "random_enemy_n",
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self",
            "weight": 0.0032
          }
        }
      ],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "trigger_attacker",
          "chance": 0.6,
          "duration": 2
        }
      ],
      "targets": [
        "random_enemy_n"
      ]
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "자신의 통솔이 15→30포인트 증가한다",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 처음 피해를 받은 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 2명이 받는 피해가 5%→10% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "(통솔의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "30%→60% 확률로 공격자에게 2턴 동안 지속되는 무장 해제 효과를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ],
    "trigger": {
      "event": "damage",
      "role": "taken",
      "chance": 1,
      "maxPerTurn": 1
    },
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "statMods": [
            {
              "stat": "통솔",
              "min": 30,
              "max": 30,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「매 턴 처음 피해를 받은 후, 랜덤 적군 2명이 받는 피해가 10% 증가하며(통솔의 영향 받음)」
    c.buff(0);   // 받는피해 +5%→10%, 대상 random_enemy_n, 2턴, 최대 1중첩
    // 「60% 확률로 공격자에게 2턴 동안 지속되는 무장 해제 효과를 부여한다」
    c.status(0);   // 무장 해제, 대상 trigger_attacker, 확률 60%, 2턴
  },
});
