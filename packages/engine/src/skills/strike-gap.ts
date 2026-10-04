// 틈새 공략 · 전법 · 추격 60%
// 원문: 일반 공격 후 랜덤 적군 1명에게 1턴간 혼란을 부여하고 120% 책략 피해를 줍니다. 대상이 이미 혼란 상태면 대상 측의 랜덤 우군 1명에게 100% 책략 피해를 줍니다.
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "strike-gap",
  name: "틈새 공략",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "\"이미 혼란이면 대상 측 우군에게 100%\"는 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후 랜덤 적군 1명에게 1턴간 혼란을 부여하고 120% 책략 피해를 줍니다",
      "status": "ok"
    },
    {
      "text": "대상이 이미 혼란 상태면 대상 측의 랜덤 우군 1명에게 100% 책략 피해를 줍니다",
      "status": "missing"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.2,
          "max": 1.2,
          "target": "random_enemy_1",
          "tag": "main"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:main",
          "duration": 1
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"이미 혼란이면 대상 측 우군에게 100%\"는 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 120%, 대상 random_enemy_1
    c.status(0);   // 혼란, 대상 tag:main, 1턴
  },
});
