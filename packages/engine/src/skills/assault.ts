// 강습 · 전법 · 패시브 100%
// 원문: 일반 공격 후, 랜덤 적군 단일 목표에게 이번 일반 공격 80%의 피해 전달을(를) 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "assault",
  name: "강습",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "매 행동마다 나가던 80% 피해 제거 — 원문은 일반 공격 피해 전달만(엔진 일반 공격 처리)"
    }
  ],
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
      "targets": []
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
    // 실행할 효과 없음 (상시 효과·트리거·특수 처리만 있는 전법)
  },
});
