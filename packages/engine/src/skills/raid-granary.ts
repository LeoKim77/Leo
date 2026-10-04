// 창고 기습 · 전법 · 추격 45%
// 원문: 일반 공격 후, 공격 목표에게 300%의 책략 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 이미 군량 고갈 상태를 보유한 경우, 추가로 해당 목표에게 100%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "raid-granary",
  name: "창고 기습",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'공격 목표'에게, '이미 군량 고갈이면' 추가 100% (예전엔 랜덤 적에게 조건 없이)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 공격 목표에게 300%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 이미 군량 고갈 상태를 보유한 경우",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "추가로 해당 목표에게 100%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_59",
    "legacyName": "창고 기습",
    "legacyType": "추격",
    "legacyProcRate": "45%",
    "raw": "일반 공격 후, 공격 목표에게 150%→300%의 책략 피해를 주며, 2턴 동안 지속되는 군량 고갈을(를) 부여한다. 목표가 이미 군량 고갈 상태를 보유한 경우, 추가로 해당 목표에게 50%→100%의 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.5,
          "max": 3,
          "target": "tag:t"
        },
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 1,
          "target": "tag:t"
        }
      ],
      "statusEffects": [
        {
          "name": "군량 고갈",
          "target": "tag:t",
          "duration": 2
        }
      ],
      "targets": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "공격 목표에게 150%→300%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 군량 고갈을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 이미 군량 고갈 상태를 보유한 경우",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "추가로 해당 목표에게 50%→100%의 책략 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    const t = c.tag('t', c.eventCtx && c.eventCtx.defender ? [c.eventCtx.defender] : []);
    const had = t.length > 0 && c.has(t[0], '군량 고갈');
    // 「일반 공격 후, 공격 목표에게 300%의 책략 피해를 주며」
    c.damage(0);
    // 「2턴 동안 지속되는 군량 고갈을(를) 부여한다」
    c.status(0);
    // 「목표가 이미 군량 고갈 상태를 보유한 경우」
    // 「추가로 해당 목표에게 100%의 책략 피해를 준다」
    if (had) c.damage(1);
  },
});
