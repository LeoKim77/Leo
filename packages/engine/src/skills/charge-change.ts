// 기민한 전술 · 전법 · 액티브 40%
// 원문: 무작위 적군 1명에게 360% 병기 피해를 주고, 자신이 다음에 사용하는 준비형 전법의 준비 턴을 일정 횟수 생략합니다.
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "charge-change",
  name: "기민한 전술",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 준비 턴 생략 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "무작위 적군 1명에게 360% 병기 피해를 주고",
      "status": "ok"
    },
    {
      "text": "자신이 다음에 사용하는 준비형 전법의 준비 턴을 일정 횟수 생략합니다",
      "status": "missing"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 3.6,
          "max": 3.6,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 준비 턴 생략 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 360%, 대상 random_enemy_1
  },
});
