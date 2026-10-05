// 국경의 장수 · 고유 전법 · 추격 50%
// 원문: 일반 공격 후, 2턴 동안 자신의 피신율이 24% 증가하며(선공의 영향 받음), 이후 랜덤 적군 2명에게 140%의 병기와 책략 피해를 준다(추가로 양측 선공 차이의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-gongsun-zan",
  name: "국경의 장수",
  kind: "추격",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "선공 영향·선공 차이 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 자신의 피신율이 24%증가하며(선공의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "이후 랜덤 적군 2명에게 140%의 병기와 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "ㅏ (추가로 양측 선공 차이의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 1.4
        },
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "피신",
          "min": 0.24,
          "max": 0.24,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": [
        "random_enemy_n"
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "선공 영향·선공 차이 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 140%
    c.damage(1);   // 책략 140%
    c.buff(0);   // 피신 +24%, 대상 self, 2턴, 최대 1중첩
  },
});
