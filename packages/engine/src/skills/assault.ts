// 강습 · 전법 · 패시브 100%
// 원문: 일반 공격 후, 랜덤 적군 단일 목표에게 이번 일반 공격 80%의 피해 전달을(를) 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "assault",
  name: "강습",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 랜덤 적군 단일 목표에게 이번 일반 공격 80%의 피해 전달을(를) 준다",
      "status": "ok",
      "reviewed": "일반 공격 후 피해 전달(transfer) 구현"
    }
  ],
  def: {
    "legacyId": "skill_64",
    "legacyName": "강습",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "일반 공격 후, 랜덤 적군 단일 목표에게 이번 일반 공격 40%→80%의 피해 전달을(를) 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.4,
          "max": 0.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 단일 목표에게 이번 일반 공격 40%→80%의 피해 전달을(를) 준다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "transfer": {
      "ratio": 0.8,
      "target": "random_enemy_1",
      "count": 1
    }
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 40%→80%
  },
});
