// 병기 파괴 · 전법 · 액티브 50%
// 원문: 적군 무작위 2명에게 220%의 병기 피해를 입히고, 75% 확률로 무장해제 상태를 부여합니다. 지속시간은 1턴입니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-spear-edge",
  name: "병기 파괴",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 무작위 2명에게 220%의 병기 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "75% 확률로 무장해제 상태를 부여합니다",
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
          "min": 2.2,
          "max": 2.2,
          "target": "random_enemy_n",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:e",
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
    c.damage(0);   // 병기 220%, 대상 random_enemy_n
    c.status(0);   // 무장 해제, 대상 tag:e, 확률 75%, 1턴
  },
});
