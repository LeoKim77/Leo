// 광풍의 분노 · 전법 · 지휘 100%
// 원문: 2번째와 4번째 턴 시작 시, 전체 적군과 아군이 2턴 동안 폭풍 상태가 된다. 홀수 턴 시작 시, 60% 확률로 전체 적군에게 100%의 책략 피해를 준다. 짝수 턴 시작 시, 60% 확률로 랜덤 적군 단일 목표에게 280%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "strong-wind",
  name: "광풍의 분노",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "2번째와 4번째 턴 시작 시, 전체 적군과 아군이 2턴 동안 폭풍 상태가 된다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[1]"
      ]
    },
    {
      "text": "홀수 턴 시작 시, 60% 확률로 전체 적군에게 100%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "짝수 턴 시작 시, 60% 확률로 랜덤 적군 단일 목표에게 280%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_2",
    "legacyName": "광풍의 분노",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "2번째와 4번째 턴 시작 시, 전체 적군과 아군이 2턴 동안 폭풍 상태가 된다. 홀수 턴 시작 시, 60% 확률로 전체 적군에게 50%→100%의 책략 피해를 준다. 짝수 턴 시작 시, 60% 확률로 랜덤 적군 단일 목표에게 140%→280%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 1,
          "target": "all_enemy",
          "chance": 0.6,
          "turnCond": {
            "parity": "odd"
          }
        },
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 2.8,
          "target": "random_enemy_1",
          "chance": 0.6,
          "turnCond": {
            "parity": "even"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "폭풍",
          "target": "all_enemy",
          "turnCond": {
            "turns": [
              2,
              4
            ]
          }
        },
        {
          "name": "폭풍",
          "target": "all_ally",
          "turnCond": {
            "turns": [
              2,
              4
            ]
          }
        }
      ],
      "targets": []
    },
    "chanceFixed": true,
    "preciseApplied": true,
    "clauses": [
      {
        "text": "2번째와 4번째 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 적군과 아군이 2턴 동안 폭풍 상태가 된다",
        "impl": [
          "statusEffects[0]",
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "홀수 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 전체 적군에게 50%→100%의 책략 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "짝수 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 랜덤 적군 단일 목표에게 140%→280%의 책략 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「홀수 턴 시작 시, 60% 확률로 전체 적군에게 100%의 책략 피해를 준다」
    c.damage(0);   // 책략 50%→100%, 대상 all_enemy, 확률 60%
    // 「짝수 턴 시작 시, 60% 확률로 랜덤 적군 단일 목표에게 280%의 책략 피해를 준다」
    c.damage(1);   // 책략 140%→280%, 대상 random_enemy_1, 확률 60%
    // 「2번째와 4번째 턴 시작 시, 전체 적군과 아군이 2턴 동안 폭풍 상태가 된다」
    c.status(0);   // 폭풍, 대상 all_enemy
    c.status(1);   // 폭풍, 대상 all_ally
  },
});
