// 공리공론 · 고유 전법 · 액티브 50%
// 원문: 2턴 동안 랜덤 아군 2명이 받는 책략 피해가 20% 감소하며, 병력을 회복한다(치유율: 140%, 지력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-jian-yong",
  name: "공리공론",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "",
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
      "text": "2턴 동안 랜덤 아군 2명이 받는 책략 피해가 20% 감소하며",
      "status": "ok"
    },
    {
      "text": "병력을 회복한다(치유율: 140%, 지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.4,
          "max": 1.4,
          "target": "tag:two"
        }
      ],
      "buffs": [
        {
          "stat": "받는책략피해",
          "min": -0.2,
          "max": -0.2,
          "target": "tag:two",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「2턴 동안 랜덤 아군 2명이 받는 책략 피해가 20% 감소하며」
    c.tag('two', c.targets('random_ally_n'));
    c.buff(0);
    // 「병력을 회복한다(치유율: 140%, 지력의 영향 받음)」
    c.heal(0);
  },
});
