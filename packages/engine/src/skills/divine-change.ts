// 뛰어난 응변 · 전법 · 액티브 100%
// 원문: 첫 4턴에 발동할 경우, 아군 무작위 2명의 병력을 회복합니다. 치료율: 110%(지력의 영향을 받음). 후반 4턴에 발동할 경우, 적군 무작위 2명에게 160%의 책략 피해를 입힙니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "divine-change",
  name: "뛰어난 응변",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "첫 4턴에 발동할 경우, 아군 무작위 2명의 병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율: 110%(지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "후반 4턴에 발동할 경우, 적군 무작위 2명에게 160%의 책략 피해를 입힙니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "random_enemy_n",
          "turnCond": {
            "minTurn": 5
          }
        }
      ],
      "heal": [
        {
          "min": 1.1,
          "max": 1.1,
          "target": "random_ally_n",
          "turnCond": {
            "maxTurn": 4
          }
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 160%, 대상 random_enemy_n
    c.heal(0);   // 치유율 110%, 대상 random_ally_n
  },
});
