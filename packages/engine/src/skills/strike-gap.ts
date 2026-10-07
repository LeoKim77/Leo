// 틈새 공략 · 전법 · 추격 60%
// 원문(도감 2026-10-07): 일반 공격 후 랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며, 180%의 책략 피해를 준다. 목표가 혼란 상태면 목표의 랜덤 우군 단일 목표에게 100%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
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
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 120% → 180%. \"목표가 혼란 상태면\"은 혼란 부여 전 상태로 판정(예전 해석 유지 — 사용자 확인 질문)"
    },
    {
      "date": "2026-10-04",
      "note": "'대상이 이미 혼란이면 대상 측 랜덤 우군 1명에게 100% 책략' 구현"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후 랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며",
      "status": "ok"
    },
    {
      "text": "180%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "목표가 혼란 상태면 목표의 랜덤 우군 단일 목표에게 100%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.8,
          "max": 1.8,
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
    // 「일반 공격 후 랜덤 적군 단일 목표에게 1턴 동안 지속되는 혼란을(를) 부여하며, 180%의 책략 피해를 준다」
    const t = c.tag('main', c.targets('random_enemy_1'));
    const was = t.length > 0 && c.has(t[0], '혼란');
    c.status(0);
    c.damage(0);
    // 「목표가 혼란 상태면 목표의 랜덤 우군 단일 목표에게 100%의 책략 피해를 준다」 — 혼란을 걸기 전 상태로 판정(확인 질문 중)
    if (was) { c.tag('f', [c.pick(c.friendsOf(t[0]))]); c.damage(1); }
  },
});
