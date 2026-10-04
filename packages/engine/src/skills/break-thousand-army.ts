// 천군격파 · 전법 · 추격 40%
// 원문: 일반 공격 후, 적군 무작위 2명에게 180%의 책략 피해를 입힙니다. 또한 35% 확률(지력의 영향을 받음)로 해당 피해가 추가로 20% 증가합니다. 각 대상은 독립적으로 판정됩니다.
// 원문 절 구현: ok / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-thousand-army",
  name: "천군격파",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "\"35% 확률로 피해 20% 증가\"를 기대값(×1.07)으로 처리, 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 적군 무작위 2명에게 180%의 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "또한 35% 확률(지력의 영향을 받음)로 해당 피해가 추가로 20% 증가합니다",
      "status": "approx"
    },
    {
      "text": "각 대상은 독립적으로 판정됩니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.926,
          "max": 1.926,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"35% 확률로 피해 20% 증가\"를 기대값(×1.07)으로 처리, 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 192.6%, 대상 random_enemy_n
  },
});
