// 천공장군 · 고유 전법 · 패시브 100%
// 원문: 매 턴 행동 시, 80% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 요술을(를) 부여한다. 자신이 피해를 받을 때, 피해를 준 상대가 요술 상태면 이번 피해가 30% 감소한다(통솔의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-mancheng",
  name: "천공장군",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "요술 80% 는 시전 1회 판정(R-021). 피해 감소는 이번 1회 피해(FEAT-033)",
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
      "text": "매 턴 행동 시, 80% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 요술을(를) 부여한다",
      "status": "ok"
    },
    {
      "text": "자신이 피해를 받을 때, 피해를 준 상대가 요술 상태면 이번 피해가 30% 감소한다(통솔의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "action",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "요술",
          "target": "random_enemy_n",
          "duration": 2,
          "chance": 0.8,
          "chanceOnce": true
        }
      ],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "pre_damage",
          "role": "taken",
          "chance": 1
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "요술 80% 는 시전 1회 판정(R-021). 피해 감소는 이번 1회 피해(FEAT-033)",
    "replacedLegacy": false
  },
  run(c) {
    // 「매 턴 행동 시, 80% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 요술을(를) 부여한다」 (판정 1번 → 2명 모두)
    c.status(0);
  },
  partRuns: [
    (c) => {
      // 「자신이 피해를 받을 때, 피해를 준 상대가 요술 상태면 이번 피해가 30% 감소한다(통솔의 영향 받음)」 — FEAT-033 이번 1회 피해만
      const e = c.eventCtx;
      if (!e || !e.attacker || !c.has(e.attacker, '요술')) return;
      c.unit._hitCut = Math.min(0.9, (c.unit._hitCut || 0) + 0.3 * c.infl('통솔'));
      c.log.push(`${c.turn}턴:   [${c.unit.name}]의 「천공장군」: 요술 상태의 [${e.attacker.name}]에게 받는 이번 피해 감소`);
    },
  ],
});
