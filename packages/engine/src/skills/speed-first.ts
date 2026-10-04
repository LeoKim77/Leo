// 신속전개 · 전법 · 추격 40%
// 원문: 일반 공격 후 2턴 동안 자신의 선공이 30포인트 증가하며, 랜덤 적군 2명에게 180%의 병기 피해(추가로 선공의 영향 받음)를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "speed-first",
  name: "신속전개",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후 2턴 동안 자신의 선공이 30포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "랜덤 적군 2명에게 180%의 병기 피해(추가로 선공의 영향 받음)를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_49",
    "legacyName": "신속전개",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후 2턴 동안 자신의 선공이 15→30포인트 증가하며, 랜덤 적군 2명에게 90%→180%의 병기 피해(추가로 선공의 영향 받음)를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.9,
          "max": 1.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "선공",
          "min": 15,
          "max": 30,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 후 2턴 동안 자신의 선공이 15→30포인트 증가",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 2명에게 90%→180%의 병기 피해(추가로 선공의 영향 받음)를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후 2턴 동안 자신의 선공이 30포인트 증가하며」
    c.statMod(0);   // 선공 15→30, 2턴, 최대 1중첩
    // 「랜덤 적군 2명에게 180%의 병기 피해(추가로 선공의 영향 받음)를 준다」
    c.damage(0);   // 병기 90%→180%
  },
});
