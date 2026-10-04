// 간파력 · 고유 전법 · 액티브 100%
// 원문: 전체 적군에게 도사를 부여한다. 도사: 다음에 일반 공격 외의 다른 피해를 받은 후, 공격자의 병력을 회복시키며(치유율 80%, 지력의 영향 받음), 추가로 법정으로부터 120%의 책략 피해를 받는다.
// 원문 절 구현: missing / missing / missing / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-fa-zheng",
  name: "간파력",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "unsupported",
    "note": "「도사」(다음 피해 후 회복·반사) 상태는 엔진에 없는 메커니즘",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전체 적군에게 도사를 부여한다",
      "status": "missing"
    },
    {
      "text": "도사: 다음에 일반 공격 외의 다른 피해를 받은 후",
      "status": "missing"
    },
    {
      "text": "공격자의 병력을 회복시키며(치유율 80%, 지력의 영향 받음)",
      "status": "missing"
    },
    {
      "text": "추가로 법정으로부터 120%의 책략 피해를 받는다",
      "status": "missing"
    }
  ],
  def: null,
});
