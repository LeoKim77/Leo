// 금성의 철벽 · 전법 · 지휘 100%
// 원문(도감 2026-10-07): 턴 시작 시, 전체 아군이 80% 확률로 1스택의 방어을(를) 획득하며, 매 턴 확률이 8% 감소한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "golden-fortress",
  name: "금성의 철벽",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "사용자 확인(R-057, 2026-10-07): 지금 해석 확정"
    },
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 저항 → 방어 1스택, 확률 감소 12%p → 8%p (80·72·64·…·24%)"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 확률 80%에서 매 턴 12%p 감소, 저항은 1턴 유지로 처리",
    "source": "authored"
  },
  clauses: [
    {
      "text": "턴 시작 시, 전체 아군이 80% 확률로 1스택의 방어을(를) 획득하며",
      "status": "ok"
    },
    {
      "text": "매 턴 확률이 8% 감소한다",
      "status": "ok",
      "reviewed": "매 턴 8%p 감소(80→72→…→24%) — 사용자 확인 R-057"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "all_ally",
          "chance": 0.8,
          "chanceStepPerTurn": -0.08
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 확률 80%에서 매 턴 12%p 감소, 저항은 1턴 유지로 처리",
    "replacedLegacy": false
  },
  run(c) {
    // 「턴 시작 시, 전체 아군이 80% 확률로 1스택의 방어을(를) 획득하며」「매 턴 확률이 8% 감소한다」 — 1턴 80%, 2턴 72% … 8턴 24% (무장마다 판정)
    const st = c.skill.effects.statusEffects[0];
    c.status({ name: st.name, target: st.target, chance: Math.max(0, st.chance + st.chanceStepPerTurn * (c.turn - 1)) });
  },
});
