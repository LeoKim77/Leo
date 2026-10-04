// 틈새 공략 · 전법 · 추격 60%
// 원문: 일반 공격 후 랜덤 적군 1명에게 1턴간 혼란을 부여하고 120% 책략 피해를 줍니다. 대상이 이미 혼란 상태면 대상 측의 랜덤 우군 1명에게 100% 책략 피해를 줍니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "strike-gap",
  name: "틈새 공략",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "원문 전체 구현 (2026-10-04 함수 보정)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "'대상이 이미 혼란이면 대상 측 랜덤 우군 1명에게 100% 책략' 구현"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후 랜덤 적군 1명에게 1턴간 혼란을 부여하고 120% 책략 피해를 줍니다",
      "status": "ok"
    },
    {
      "text": "대상이 이미 혼란 상태면 대상 측의 랜덤 우군 1명에게 100% 책략 피해를 줍니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.2,
          "max": 1.2,
          "target": "tag:main"
        },
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "tag:f"
        }
      ],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:main",
          "duration": 1
        }
      ],
      "targets": [
        "random_enemy_1"
      ]
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "원문 전체 구현 (2026-10-04 함수 보정)",
    "replacedLegacy": false
  },
  run(c) {
    // 「일반 공격 후 랜덤 적군 1명에게 1턴간 혼란을 부여하고 120% 책략 피해를 줍니다」
    const t = c.tag('main', c.targets('random_enemy_1'));
    const was = t.length > 0 && c.has(t[0], '혼란');
    c.status(0);
    c.damage(0);
    // 「대상이 이미 혼란 상태면 대상 측의 랜덤 우군 1명에게 100% 책략 피해를 줍니다」
    if (was) { c.tag('f', [c.pick(c.friendsOf(t[0]))]); c.damage(1); }
  },
});
