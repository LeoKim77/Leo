// 장소 고유 전법 · 고유 전법 · 액티브 60%
// 원문: 아군 무작위 2명의 디버프 상태 2종을 해제하고, 병력을 회복합니다. 치료율: 180%(지력의 영향을 받음). 또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음). 지속시간은 2턴입니다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-zhao",
  name: "장소 고유 전법",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "대상 공유·지력 영향",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "디버프 해제와 회복이 같은 랜덤 아군 2명에게, 지력 영향"
    }
  ],
  clauses: [
    {
      "text": "아군 무작위 2명의 디버프 상태 2종을 해제하고",
      "status": "ok"
    },
    {
      "text": "병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율: 180%(지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "지속시간은 2턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "heal": [
        {
          "min": 1.8,
          "max": 1.8,
          "target": "tag:two"
        }
      ],
      "dispel": [
        {
          "target": "tag:two",
          "count": 2
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "all_enemy",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ]
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "대상 공유·지력 영향 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    c.tag('two', c.targets('random_ally_n'));
    // 「아군 무작위 2명의 디버프 상태 2종을 해제하고」
    c.dispel(0);
    // 「병력을 회복합니다」
    c.heal(0);
    // 「치료율: 180%(지력의 영향을 받음)」
    // 「또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음)」
    c.buff(0);
  },
});
