// 신속기습 · 고유 전법 · 패시브 100%
// 원문: 매 턴 행동 시, 1턴 동안 자신의 무력 수치가 선공 수치의 40% 만큼 증가한다. 자신보다 선공이 낮은 적군 1명 당 1스택의 신속을 획득한다: 1턴 동안 주는 피해와 회심 확률이 5% 증가하며(선공의 영향 받음), 해당 적군에게 30%의 병기 피해를 준다.
// 원문 절 구현: missing / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xiahou-yuan",
  name: "신속기습",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "매 턴 행동 시, 1턴 동안 자신의 무력 수치가 선공 수치의 40% 만큼 증가한다",
      "status": "missing"
    },
    {
      "text": "자신보다 선공이 낮은 적군 1명 당 1스택의 신속을 획득한다: 1턴 동안 주는 피해와 회심 확률이 5% 증가하며(선공의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0].countScale",
        "buffs[1].countScale"
      ]
    },
    {
      "text": "해당 적군에게 30%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_29",
    "legacyName": "신속기습",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시, 1턴 동안 자신의 무력 수치가 선공 수치의 20%→40% 만큼 증가한다. 자신보다 선공이 낮은 적군 1명 당 1스택의 신속을 획득한다: 1턴 동안 주는 피해와 회심 확률이 2.5%→5% 증가하며(선공의 영향 받음), 해당 적군에게 15%→30%의 병기 피해를 준다.",
    "effects": {
      "statMods": [
        {
          "stat": "무력",
          "min": 46.900000000000006,
          "max": 93.80000000000001,
          "target": "self"
        }
      ],
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.15,
          "max": 0.3,
          "target": "all_enemy",
          "condition": {
            "type": "statCompareUnits",
            "who1": "attacker",
            "who2": "target",
            "stat": "선공",
            "op": ">"
          }
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0,
          "max": 0,
          "countScale": {
            "statCompare": {
              "stat": "선공",
              "op": "<"
            },
            "perCount": 0.03
          }
        },
        {
          "stat": "회심",
          "min": 0,
          "max": 0,
          "target": "self",
          "duration": 1,
          "countScale": {
            "statCompare": {
              "stat": "선공",
              "op": "<"
            },
            "perCount": 0.05
          }
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "매 턴 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "1턴 동안 자신의 무력 수치가 선공 수치의 20%→40% 만큼 증가한다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신보다 선공이 낮은 적군 1명 당 1스택의 신속을 획득한다: 1턴 동안 주는 피해와 회심 확률이 2.5%→5% 증가",
        "impl": [
          "buffs[0].countScale",
          "buffs[1].countScale"
        ],
        "status": "ok"
      },
      {
        "text": "(선공의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "해당 적군에게 15%→30%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 46.900000000000006→93.80000000000001, 대상 self
    // 「해당 적군에게 30%의 병기 피해를 준다」
    c.damage(0);   // 병기 15%→30%, 대상 all_enemy, 조건 statCompareUnits
    c.buff(0);   // 주는피해 0%
    c.buff(1);   // 회심 0%, 대상 self, 1턴
  },
});
