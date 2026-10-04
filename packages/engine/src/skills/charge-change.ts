// 기민한 전술 · 전법 · 액티브 40%
// 원문: 무작위 적군 1명에게 360% 병기 피해를 주고, 자신이 다음에 사용하는 준비형 전법의 준비 턴을 일정 횟수 생략합니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "charge-change",
  name: "기민한 전술",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "준비 턴 생략 1회로 해석 (2026-10-04 함수 보정)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "다음 준비형 전법 준비 생략 구현('일정 횟수'는 1회로 해석)"
    }
  ],
  clauses: [
    {
      "text": "무작위 적군 1명에게 360% 병기 피해를 주고",
      "status": "ok"
    },
    {
      "text": "자신이 다음에 사용하는 준비형 전법의 준비 턴을 일정 횟수 생략합니다",
      "status": "ok"
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
      "buffs": [
        {
          "stat": "준비생략",
          "min": 1,
          "max": 1,
          "target": "self"
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "준비 턴 생략 1회로 해석 (2026-10-04 함수 보정)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 360%, 대상 random_enemy_1
    c.buff(0);   // 준비생략 +100%, 대상 self
  },
});
