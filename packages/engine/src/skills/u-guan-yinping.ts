// 호소생위 · 고유 전법 · 패시브 100%
// 원문: 전투 중, 매 턴 처음으로 액티브 전법을 발동한 후 40% 확률(무력의 영향을 받음)로 적군 무작위 2명에게 260%의 병기 피해를 입히고, 대상에게 허약 상태를 부여합니다. 지속시간은 1턴입니다.
// 원문 절 구현: approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guan-yinping",
  name: "호소생위",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "무력 영향 미반영. \"매 턴 처음으로 발동한 후\"를 매 턴 첫 성공 판정까지로 처리",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 중, 매 턴 처음으로 액티브 전법을 발동한 후 40% 확률(무력의 영향을 받음)로 적군 무작위 2명에게 260%의 병기 피해를 입히고",
      "status": "approx"
    },
    {
      "text": "대상에게 허약 상태를 부여합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 1턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "cast",
      "castType": "액티브",
      "role": "self",
      "chance": 0.4,
      "maxPerTurn": 1
    },
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.6,
          "max": 2.6,
          "target": "random_enemy_n",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "허약",
          "target": "tag:e",
          "duration": 1
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "무력 영향 미반영. \"매 턴 처음으로 발동한 후\"를 매 턴 첫 성공 판정까지로 처리",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 260%, 대상 random_enemy_n
    c.status(0);   // 허약, 대상 tag:e, 1턴
  },
});
