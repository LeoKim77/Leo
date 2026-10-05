// 적군 굴복 · 전법 · 액티브 22%~ 40%
// 원문: 랜덤 적군 2명에게 1턴 동안 지속되는 무장 해제를(를) 부여한다. 목표가 무장 해제를 이미 보유한 경우, 2턴 동안 목표가 주는 피해가 15% 감소한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "subdue-soldiers",
  name: "적군 굴복",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-05",
      "note": "'이미 무장 해제'(이번 시전 전)인 목표만 주는 피해 −15% 2턴 (예전엔 조건 없이 1턴)"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 2명에게 1턴 동안 지속되는 무장 해제를(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 무장 해제를 이미 보유한 경우, 2턴 동안 목표가 주는 피해가 15% 감소한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_48",
    "legacyName": "적군 굴복",
    "legacyType": "액티브",
    "legacyProcRate": "22%~ 40%",
    "raw": "랜덤 적군 2명에게 1턴 동안 지속되는 무장 해제를(를) 부여한다. 목표가 무장 해제를 이미 보유한 경우, 2턴 동안 목표가 주는 피해가 7.5%→15% 감소한다.",
    "effects": {
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:two",
          "duration": 1
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.075,
          "max": -0.15,
          "duration": 2,
          "maxStacks": 1,
          "target": "tag:had"
        }
      ],
      "targets": [
        "random_enemy_n"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 1턴 동안 지속되는 무장 해제를(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 무장 해제를 이미 보유한 경우",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 목표가 주는 피해가 7.5%→15% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    const two = c.tag('two', c.targets('random_enemy_n'));
    c.tag('had', two.filter(u => c.has(u, '무장 해제')));
    // 「랜덤 적군 2명에게 1턴 동안 지속되는 무장 해제를(를) 부여한다」
    c.status(0);
    // 「목표가 무장 해제를 이미 보유한 경우, 2턴 동안 목표가 주는 피해가 15% 감소한다」
    c.buff(0);
  },
});
