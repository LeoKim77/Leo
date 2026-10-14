// 사방의매복 · 전법 · 액티브 45%
// 원문: 적군 전체에게 150%의 병기 피해를 입히고, 75% 확률로 군량 고갈 상태를 부여합니다. 지속시간은 1턴입니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ten-ambush",
  name: "사방의매복",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 전체에게 150%의 병기 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "75% 확률로 군량 고갈 상태를 부여합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 1턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.5,
          "max": 1.5,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "군량 고갈",
          "target": "all_enemy",
          "chance": 0.75,
          "duration": 1
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 150%, 대상 all_enemy
    c.status(0);   // 군량 고갈, 대상 all_enemy, 확률 75%, 1턴
  },
});
