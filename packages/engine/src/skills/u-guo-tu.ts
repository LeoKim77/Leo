// 아첨의 귀재 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 지력이 가장 높은 우군이 주는 피해가 30% 증가하며, 5% 확률로 1턴 동안 혼란 상태가 되고, 혼란 확률은 매 턴 5% 증가한다. 매 턴 종료 시, 지력이 가장 높은 우군이 랜덤 적군 단일 목표에게 100%의 책략 피해를 준다.
// 원문 절 구현: ok / approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guo-tu",
  name: "아첨의 귀재",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "혼란은 지력 최고 우군(자신 제외)이 받는 것으로 해석, 확률 5%×턴(검증 대기)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "매 턴 시작 시, 지력이 가장 높은 우군이 주는 피해가 30% 증가하며",
      "status": "ok"
    },
    {
      "text": "5% 확률로 1턴 동안 혼란 상태가 되고",
      "status": "approx"
    },
    {
      "text": "혼란 확률은 매 턴 5% 증가한다",
      "status": "ok"
    },
    {
      "text": "매 턴 종료 시, 지력이 가장 높은 우군이 랜덤 적군 단일 목표에게 100%의 책략 피해를 준다",
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
          "stat": "주는피해",
          "min": 0.3,
          "max": 0.3,
          "target": "highest_intel_friend",
          "duration": 1,
          "maxStacks": 1,
          "tag": "f"
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:f",
          "duration": 1
        }
      ],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1,
              "max": 1,
              "target": "random_enemy_1",
              "actor": "highest_intel_friend"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "혼란은 지력 최고 우군(자신 제외)이 받는 것으로 해석, 확률 5%×턴(검증 대기)",
    "replacedLegacy": false
  },
  run(c) {
    // 「매 턴 시작 시, 지력이 가장 높은 우군이 주는 피해가 30% 증가하며」
    const f = c.tag('f', c.targets('highest_intel_friend'));
    if (!f.length) return;
    c.buff(0);
    // 「5% 확률로 1턴 동안 혼란 상태가 되고, 혼란 확률은 매 턴 5% 증가한다」 — n턴 확률 5%×n
    if (c.chance(0.05 * c.turn)) c.status(0);
  },
  partRuns: [
    (c) => {
      // 「매 턴 종료 시, 지력이 가장 높은 우군이 랜덤 적군 단일 목표에게 100%의 책략 피해를 준다」
      if (!c.targets('highest_intel_friend').length) return;
      c.damage(0);
    },
  ],
});
