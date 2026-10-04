// 고진양번 · 고유 전법 · 지휘 100%
// 원문: 홀수 턴에 자신이 후열로부터 받는 피해가 30% 감소하고(통솔의 영향 받음), 전열로부터 받는 피해가 15% 감소한다(통솔의 영향 받음). 짝수 턴 시작 시, 75% 확률로 랜덤 적군 2명에게 1턴 동안 지속되는 침묵을(를) 부여하며, 확률은 목표마다 개별적으로 판정된다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cao-ren",
  name: "고진양번",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "홀수 턴만: 후열 공격자 피해 −30%, 전열 공격자 −15% (공격자 위치별, 통솔 영향), 짝수 턴 시작: 대상마다 75% 침묵 1턴 — 예전엔 두 감소가 항상 같이 걸리고 홀짝 구분 없음"
    }
  ],
  clauses: [
    {
      "text": "홀수 턴에 자신이 후열로부터 받는 피해가 30% 감소하고(통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "전열로부터 받는 피해가 15% 감소한다(통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[1]"
      ]
    },
    {
      "text": "짝수 턴 시작 시, 75% 확률로 랜덤 적군 2명에게 1턴 동안 지속되는 침묵을(를) 부여하며",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "확률은 목표마다 개별적으로 판정된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_30",
    "legacyName": "고진양번",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "홀수 턴에 자신이 후열로부터 받는 피해가 15%→30% 감소하고(통솔의 영향 받음), 전열로부터 받는 피해가 7.5%→15% 감소한다(통솔의 영향 받음). 짝수 턴 시작 시, 37.5%→75% 확률로 랜덤 적군 2명에게 1턴 동안 지속되는 침묵을(를) 부여하며, 확률은 목표마다 개별적으로 판정된다.",
    "effects": {
      "buffs": [
        {
          "stat": "후열공격받는피해",
          "min": -0.15,
          "max": -0.3,
          "target": "self",
          "untilTurnEnd": true,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "전열공격받는피해",
          "min": -0.075,
          "max": -0.15,
          "target": "self",
          "untilTurnEnd": true,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        }
      ],
      "statusEffects": [
        {
          "name": "침묵",
          "target": "random_enemy_n",
          "chance": 0.75,
          "duration": 1,
          "turnCond": {
            "parity": "even"
          }
        }
      ],
      "targets": [
        "random_enemy_n",
        "self"
      ]
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "홀수 턴에 자신이 후열로부터 받는 피해가 15%→30% 감소",
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
        "text": "전열로부터 받는 피해가 7.5%→15% 감소한다(통솔의 영향 받음)",
        "impl": [
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "짝수 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "37.5%→75% 확률로 랜덤 적군 2명에게 1턴 동안 지속되는 침묵을(를) 부여",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "확률은 목표마다 개별적으로 판정된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「홀수 턴에 자신이 후열로부터 받는 피해가 30% 감소하고(통솔의 영향 받음)」
    // 「전열로부터 받는 피해가 15% 감소한다(통솔의 영향 받음)」
    c.buff(0); c.buff(1);   // 홀수 턴, 그 턴 종료까지
    // 「짝수 턴 시작 시, 75% 확률로 랜덤 적군 2명에게 1턴 동안 지속되는 침묵을(를) 부여하며」
    // 「확률은 목표마다 개별적으로 판정된다」
    c.status(0);
  },
});
