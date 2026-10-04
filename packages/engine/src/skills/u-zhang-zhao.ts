// 장소 고유 전법 · 고유 전법 · 액티브 60%
// 원문: 아군 무작위 2명의 디버프 상태 2종을 해제하고, 병력을 회복합니다. 치료율: 180%(지력의 영향을 받음). 또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음). 지속시간은 2턴입니다.
// 원문 절 구현: ok / ok / approx / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-zhao",
  name: "장소 고유 전법",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "해제·회복 대상을 따로 뽑음, 지력 영향 미반영",
    "source": "authored"
  },
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
      "status": "approx"
    },
    {
      "text": "또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "지속시간은 2턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.8,
          "max": 1.8,
          "target": "random_ally_n"
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "all_enemy",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "dispel": [
        {
          "target": "random_ally_n",
          "count": 2
        }
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해제·회복 대상을 따로 뽑음, 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.heal(0);   // 치유율 180%, 대상 random_ally_n
    c.buff(0);   // 주는피해 -24%, 대상 all_enemy, 2턴, 최대 1중첩
    c.dispel(0);   // 디버프 2가지 제거, 대상 random_ally_n
  },
});
