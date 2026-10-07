// 적재적소 · 전법 · 액티브 75%
// 원문(도감 2026-10-07): 2턴 동안 지력이 가장 높은 아군 단일 목표가 받는 피해가 25% 감소하며(지력의 영향 받음), 1스택의 방어을(를) 획득한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "use-talent",
  name: "적재적소",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "지력 영향 반영",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 우군 → 아군(자신 포함), 저항 → 방어 1스택, 감소에 지력 영향"
    },
    {
      "date": "2026-10-05",
      "note": "지력 영향 반영"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 지력이 가장 높은 아군 단일 목표가 받는 피해가 25% 감소하며(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "1스택의 방어을(를) 획득한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_intel_ally",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          },
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "highest_intel_ally"
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "지력 영향 반영 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // 「2턴 동안 지력이 가장 높은 아군 단일 목표가 받는 피해가 25% 감소하며(지력의 영향 받음)」
    c.tag('t', c.targets('highest_intel_ally'));
    c.buff({ ...c.skill.effects.buffs[0], target: 'tag:t' });
    // 「1스택의 방어을(를) 획득한다」
    c.status({ ...c.skill.effects.statusEffects[0], target: 'tag:t' });
  },
});
