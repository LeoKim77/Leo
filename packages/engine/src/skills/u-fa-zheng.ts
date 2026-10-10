// 간파력 · 고유 전법 · 액티브 100%
// 원문: 전체 적군에게 도사를 부여한다. 도사: 다음에 일반 공격 외의 다른 피해를 받은 후, 공격자의 병력을 회복시키며(치유율 80%, 지력의 영향 받음), 추가로 법정으로부터 120%의 책략 피해를 받는다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-fa-zheng",
  name: "간파력",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "도사 표식 구현 (FEAT-024)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 전체 미구현 → 도사 표식 구현(FEAT-024)"
    }
  ],
  clauses: [
    {
      "text": "전체 적군에게 도사를 부여한다",
      "status": "ok"
    },
    {
      "text": "도사: 다음에 일반 공격 외의 다른 피해를 받은 후",
      "status": "ok"
    },
    {
      "text": "공격자의 병력을 회복시키며(치유율 80%, 지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "추가로 법정으로부터 120%의 책략 피해를 받는다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "statusEffects": [
        {
          "name": "도사",
          "target": "all_enemy",
          "duration": 99,
          "data": {
            "heal": 0.8,
            "dmg": 1.2
          }
        }
      ],
      "targets": [
        "all_enemy"
      ]
    }
  },
  run(c) {
    // 「전체 적군에게 도사를 부여한다」
    c.status(0);   // 도사: 다음에 일반 공격 외 피해를 받은 후 → 공격자 회복 80% + 법정의 책략 120% (엔진 resolveDamageMarks)
  },
});
