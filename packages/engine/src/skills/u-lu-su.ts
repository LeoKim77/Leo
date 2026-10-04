// 형주 분할 · 고유 전법 · 액티브 45%
// 원문: 적군과 우군 전체의 랜덤 목표 4개에게 1턴 동안 지속되는 무장 해제을(를) 부여한다. 우군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 감소한다(지력의 영향 받음). 적군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 증가한다(지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lu-su",
  name: "형주 분할",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'적군과 우군 전체의 랜덤 목표 4개'(자신 제외) 무장 해제 1턴, 우군이면 받는 피해 −20%, 적군이면 +20%(지력 영향) — 예전엔 랜덤 적 1명에게만"
    }
  ],
  clauses: [
    {
      "text": "적군과 우군 전체의 랜덤 목표 4개에게 1턴 동안 지속되는 무장 해제을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "우군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 감소한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "적군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 증가한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_20",
    "legacyName": "형주 분할",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "적군과 아군 전체의 랜덤 목표 4개에게 1턴 동안 지속되는 무장 해제을(를) 부여한다. 아군 목표가 선택되면 1턴 동안 목표가 받는 피해가 10%→20% 감소한다(지력의 영향 받음). 적군 목표가 선택되면 1턴 동안 목표가 받는 피해가 10%→20% 증가한다(지력의 영향 받음).",
    "effects": {
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:four",
          "duration": 1
        }
      ],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:four",
          "duration": 1,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          },
          "condition": {
            "type": "side",
            "who": "target",
            "is": "ally"
          }
        },
        {
          "stat": "받는피해",
          "min": 0.1,
          "max": 0.2,
          "target": "tag:four",
          "duration": 1,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          },
          "condition": {
            "type": "side",
            "who": "target",
            "is": "enemy"
          }
        }
      ],
      "targets": []
    },
    "clauses": [
      {
        "text": "적군과 아군 전체의 랜덤 목표 4개에게 1턴 동안 지속되는 무장 해제을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "아군 목표가 선택되면 1턴 동안 목표가 받는 피해가 10%→20% 감소한다(지력의 영향 받음)",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "적군 목표가 선택되면 1턴 동안 목표가 받는 피해가 10%→20% 증가한다(지력의 영향 받음)",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    c.tag('four', c.targets('random_all_4'));
    // 「적군과 우군 전체의 랜덤 목표 4개에게 1턴 동안 지속되는 무장 해제을(를) 부여한다」
    c.status(0);
    // 「우군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 감소한다(지력의 영향 받음)」
    c.buff(0);
    // 「적군 목표가 선택되면 1턴 동안 목표가 받는 피해가 20% 증가한다(지력의 영향 받음)」
    c.buff(1);
  },
});
