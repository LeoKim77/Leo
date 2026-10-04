// 강렬 · 고유 전법 · 패시브 100%
// 원문: 자신이 피해를 받은 후, 40% 확률로 피해를 준 목표에게 80%의 병기 피해를 주며(추가로 통솔의 영향 받음), 2턴 동안 해당 목표가 주는 피해가 30% 감소한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xiahou-dun",
  name: "강렬",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "자신이 피해를 받은 후, 40% 확률로 피해를 준 목표에게 80%의 병기 피해를 주며(추가로 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "damage[0].statScale",
        "trigger"
      ]
    },
    {
      "text": "2턴 동안 해당 목표가 주는 피해가 30% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_24",
    "legacyName": "강렬",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신이 피해를 받은 후, 20%→40% 확률로 피해를 준 목표에게 40%→80%의 병기 피해를 주며(추가로 통솔의 영향 받음), 2턴 동안 해당 목표가 주는 피해가 15%→30% 감소한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.4,
          "max": 0.8,
          "target": "trigger_attacker",
          "statScale": {
            "stat": "통솔"
          }
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.15,
          "max": -0.3,
          "target": "trigger_attacker",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "trigger": {
      "event": "damage",
      "role": "taken",
      "chance": 0.4
    },
    "triggerApplied": true,
    "preciseApplied": true,
    "clauses": [
      {
        "text": "자신이 피해를 받은 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "20%→40% 확률로 피해를 준 목표에게 40%→80%의 병기 피해를 주며(추가로 통솔의 영향 받음)",
        "impl": [
          "damage[0].statScale",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 해당 목표가 주는 피해가 15%→30% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 40%→80%, 대상 trigger_attacker
    // 「2턴 동안 해당 목표가 주는 피해가 30% 감소한다」
    c.buff(0);   // 주는피해 -15%→-30%, 대상 trigger_attacker, 2턴, 최대 1중첩
  },
});
