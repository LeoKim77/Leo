// 교책인봉 · 고유 전법 · 패시브 100%
// 원문: 자신이 일반 공격을 하거나 추격 전법을 발동한 후, 40% 확률(지력의 영향을 받음)로 적군 무작위 2명에게 100%의 책략 피해를 입힙니다. 또한 대상이 받는 피해를 4% 증가시킵니다(지력의 영향을 받음). 이 효과는 최대 4회 중첩되며, 전투 종료 시까지 지속됩니다.
// 원문 절 구현: ok / approx / approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-wang-yi",
  name: "교책인봉",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신이 일반 공격을 하거나 추격 전법을 발동한 후",
      "status": "ok"
    },
    {
      "text": "40% 확률(지력의 영향을 받음)로 적군 무작위 2명에게 100%의 책략 피해를 입힙니다",
      "status": "approx"
    },
    {
      "text": "또한 대상이 받는 피해를 4% 증가시킵니다(지력의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "이 효과는 최대 4회 중첩되며",
      "status": "ok"
    },
    {
      "text": "전투 종료 시까지 지속됩니다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "afterBasic": true,
      "chance": 0.4,
      "maxPerTurn": 99
    },
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "random_enemy_n",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": 0.04,
          "max": 0.04,
          "target": "tag:e",
          "duration": 999,
          "maxStacks": 4
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "cast",
          "castType": "추격",
          "role": "self",
          "chance": 0.4,
          "maxPerTurn": 99
        },
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1,
              "max": 1,
              "target": "random_enemy_n",
              "tag": "e"
            }
          ],
          "heal": [],
          "buffs": [
            {
              "stat": "받는피해",
              "min": 0.04,
              "max": 0.04,
              "target": "tag:e",
              "duration": 999,
              "maxStacks": 4
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 100%, 대상 random_enemy_n
    c.buff(0);   // 받는피해 +4%, 대상 tag:e, 전투 종료까지, 최대 4중첩
  },
});
