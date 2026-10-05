// 도광양회 · 전법 · 패시브 100%
// 원문: 고유 액티브 전법 발동률이 6% 상승합니다(지력 영향). 매 턴 시작 시 자신이 주는 책략 피해가 8% 상승하며 전투 종료까지 중첩됩니다.
// 원문 절 구현: approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "hide-light",
  name: "도광양회",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "지력 영향: 6% + 지력×0.02%p (툴팁 육손 325.55 → 12.50%, 여몽 323.15 → 12.46%), 전투 시작 스냅샷",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "책략 피해 증가 중첩 상한 제거(원문 '전투 종료까지 중첩')"
    },
    {
      "date": "2026-10-05",
      "note": "지력 영향 반영: 고유 액티브 발동률 = 6% + 지력×0.02%p (툴팁 2건 — 육손 325.55 → 12.50%, 여몽 323.15 → 12.46%)"
    }
  ],
  clauses: [
    {
      "text": "고유 액티브 전법 발동률이 6% 상승합니다(지력 영향)",
      "status": "ok"
    },
    {
      "text": "매 턴 시작 시 자신이 주는 책략 피해가 8% 상승하며 전투 종료까지 중첩됩니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는책략피해",
          "min": 0.08,
          "max": 0.08,
          "target": "self",
          "duration": 999,
          "maxStacks": 99
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "unit": {
      "uniqueProcAddDelta": 0.06,
      "uniqueProcAddPerInt": 0.0002
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는책략피해 +8%, 대상 self, 전투 종료까지, 최대 99중첩
  },
});
