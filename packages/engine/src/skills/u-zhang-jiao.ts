// 황천의 시대 · 고유 전법 · 액티브 60%
// 원문: 1턴 동안 준비 후 전체 적군에게 300%의 책략 피해를 주며, 상대가 보유 중인 디버프 상태 1개당 책략 피해 계수가 30% 증가한다. 3회 증가할 수 있으며, 자신이 황천 효과를 획득한다: 준비 전 전법 발동 시, 50% 확률로 준비를 1턴 건너뛴다. 4턴 지속된다.
// 원문 절 구현: ok / missing / missing / ok / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-jiao",
  name: "황천의 시대",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "1턴 동안 준비 후 전체 적군에게 300%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "prepTurns"
      ]
    },
    {
      "text": "상대가 보유 중인 디버프 상태 1개당 책략 피해 계수가 30% 증가한다",
      "status": "missing"
    },
    {
      "text": "3회 증가할 수 있으며",
      "status": "missing"
    },
    {
      "text": "자신이 황천 효과를 획득한다: 준비 전 전법 발동 시",
      "status": "ok",
      "impl": [
        "prepTurns"
      ]
    },
    {
      "text": "50% 확률로 준비를 1턴 건너뛴다",
      "status": "ok",
      "impl": [
        "prepTurns"
      ]
    },
    {
      "text": "4턴 지속된다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "uskill_16",
    "legacyName": "황천의 시대",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "1턴 동안 준비 후 전체 적군에게 150%→300%의 책략 피해를 주며, 상대가 보유 중인 디버프 상태 1개당 책략 피해 계수가 15%→30% 증가한다. 3회 증가할 수 있으며, 자신이 황천 효과를 획득한다: 준비 전 전법 발동 시, 25%→50% 확률로 준비를 1턴 건너뛴다. 4턴 지속된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.5,
          "max": 3
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy",
        "self"
      ],
      "statusEffects": []
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 전체 적군에게 150%→300%의 책략 피해를 주며",
        "impl": [
          "damage[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "상대가 보유 중인 디버프 상태 1개당 책략 피해 계수가 15%→30% 증가한다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "3회 증가할 수 있",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신이 황천 효과를 획득한다: 준비 전 전법 발동 시",
        "impl": [
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "25%→50% 확률로 준비를 1턴 건너뛴다",
        "impl": [
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "4턴 지속된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「1턴 동안 준비 후 전체 적군에게 300%의 책략 피해를 주며」
    c.damage(0);   // 책략 150%→300%
  },
});
