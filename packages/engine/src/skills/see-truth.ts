// 허실 간파 · 전법 · 액티브 45%
// 원문: 무작위 적군 2명의 지력과 통솔을 20만큼 빼앗아 2턴 지속시키고(지력 영향), 140% 책략 피해를 줍니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "see-truth",
  name: "허실 간파",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 빼앗은 지력·통솔은 자신에게 +20씩. 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "무작위 적군 2명의 지력과 통솔을 20만큼 빼앗아 2턴 지속시키고(지력 영향)",
      "status": "ok"
    },
    {
      "text": "140% 책략 피해를 줍니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "tag:e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "지력",
          "min": -20,
          "max": -20,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "e"
        },
        {
          "stat": "통솔",
          "min": -20,
          "max": -20,
          "target": "tag:e",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "지력",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "통솔",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 빼앗은 지력·통솔은 자신에게 +20씩. 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 지력 -20, 대상 random_enemy_n, 2턴, 최대 1중첩
    c.statMod(1);   // 통솔 -20, 대상 tag:e, 2턴, 최대 1중첩
    c.statMod(2);   // 지력 20, 대상 self, 2턴, 최대 1중첩
    c.statMod(3);   // 통솔 20, 대상 self, 2턴, 최대 1중첩
    c.damage(0);   // 책략 140%, 대상 tag:e
  },
});
