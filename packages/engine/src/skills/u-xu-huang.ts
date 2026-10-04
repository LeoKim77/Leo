// 승승장구 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표에게 350%의 병기 피해를 주며, 1턴 동안 지속되는 침묵을(를) 부여한다. 목표가 이미 침묵 상태를 보유 중이거나 병력이 가장 낮은 적군 단일 목표면 이번 피해 수치가 30% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xu-huang",
  name: "승승장구",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'랜덤 적 단일' 대상(예전엔 병력 최저 적), '이미 침묵이거나 병력이 가장 낮은 적이면 피해 +30%', 침묵 1턴"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 350%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "1턴 동안 지속되는 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 이미 침묵 상태를 보유 중이거나 병력이 가장 낮은 적군 단일 목표면 이번 피해 수치가 30% 증가한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_45",
    "legacyName": "승승장구",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 단일 목표에게 175%→350%의 병기 피해를 주며, 1턴 동안 지속되는 침묵을(를) 부여한다. 목표가 이미 침묵 상태를 보유 중이거나 병력이 가장 낮은 적군 단일 목표면 이번 피해 수치가 30% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.75,
          "max": 3.5,
          "target": "tag:m"
        }
      ],
      "statusEffects": [
        {
          "name": "침묵",
          "target": "tag:m",
          "duration": 1
        }
      ],
      "targets": [
        "random_enemy_1"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 175%→350%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 이미 침묵 상태를 보유 중이거나 병력이 가장 낮은 적군 단일 목표면 이번 피해 수치가 30% 증가한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    const t = c.tag('m', c.targets('random_enemy_1'));
    if (!t.length) return;
    const foes = c.enemiesOf(c.unit);
    // 「목표가 이미 침묵 상태를 보유 중이거나 병력이 가장 낮은 적군 단일 목표면 이번 피해 수치가 30% 증가한다」
    const bonus = c.has(t[0], '침묵') || t[0].troops <= Math.min(...foes.map(u => u.troops));
    // 「랜덤 적군 단일 목표에게 350%의 병기 피해를 주며」
    c.damage({ ...c.skill.effects.damage[0], bonusMult: bonus ? 1.3 : 1 });
    // 「1턴 동안 지속되는 침묵을(를) 부여한다」
    c.status(0);
  },
});
