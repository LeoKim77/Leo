// 적진 돌파 · 고유 전법 · 액티브 60%
// 원문: 자신의 방어 관통이(가) 5% 증가하며, 전투 종료까지 지속되고, 4회 중첩될 수 있다. 이후 랜덤 적군 2명에게 220%의 병기 피해를 주며, 65% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다. 목표가 이미 무장 해제 상태면 이번 피해가 30% 증가한다.
// 원문 절 구현: ok / note / note / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-he",
  name: "적진 돌파",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "자신의 방어 관통이(가) 5% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "전투 종료까지 지속되고",
      "status": "note"
    },
    {
      "text": "4회 중첩될 수 있다",
      "status": "note"
    },
    {
      "text": "이후 랜덤 적군 2명에게 220%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "65% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 이미 무장 해제 상태면 이번 피해가 30% 증가한다",
      "status": "ok",
      "impl": [
        "damage[0].conditionalBonusMult",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_40",
    "legacyName": "적진 돌파",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "자신의 방어 관통이(가) 2.5%→5% 증가하며, 전투 종료까지 지속되고, 4회 중첩될 수 있다. 이후 랜덤 적군 2명에게 110%→220%의 병기 피해를 주며, 65% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다. 목표가 이미 무장 해제 상태면 이번 피해가 30% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "random_enemy_n",
          "tag": "main",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "무장 해제"
            },
            "mult": 0.3
          }
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "방어관통",
          "min": 0.025,
          "max": 0.05,
          "target": "self",
          "duration": 999,
          "maxStacks": 4
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:main",
          "chance": 0.65
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "preciseApplied": true,
    "clauses": [
      {
        "text": "자신의 방어 관통이(가) 2.5%→5% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "전투 종료까지 지속되고",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "4회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 2명에게 110%→220%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "65% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 이미 무장 해제 상태면 이번 피해가 30% 증가한다",
        "impl": [
          "damage[0].conditionalBonusMult",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「이후 랜덤 적군 2명에게 220%의 병기 피해를 주며」
    c.damage(0);   // 병기 110%→220%, 대상 random_enemy_n
    // 「자신의 방어 관통이(가) 5% 증가하며」
    c.buff(0);   // 방어관통 +2.5%→5%, 대상 self, 전투 종료까지, 최대 4중첩
    // 「65% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다」
    c.status(0);   // 무장 해제, 대상 tag:main, 확률 65%
  },
});
