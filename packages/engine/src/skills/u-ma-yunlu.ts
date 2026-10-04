// 치명적 미모 · 고유 전법 · 추격 70%
// 원문: 일반 공격 후, 공격 목표에게 2턴 동안 지속되는 위협을 부여하며, 220%의 병기 피해를 준다. 80%확률로 추가로 220%의 병기 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ma-yunlu",
  name: "치명적 미모",
  kind: "추격",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 공격 목표에게 2턴 동안 지속되는 위협을 부여하며",
      "status": "ok"
    },
    {
      "text": "220%의 병기 피해를 준다",
      "status": "ok"
    },
    {
      "text": "80%확률로 추가로 220%의 병기 피해를 준다",
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
          "target": "trigger_defender"
        },
        {
          "dmgType": "병기",
          "min": 2.2,
          "max": 2.2,
          "target": "trigger_defender",
          "chance": 0.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "위협",
          "target": "trigger_defender",
          "duration": 2
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
    c.damage(0);   // 병기 220%, 대상 trigger_defender
    c.damage(1);   // 병기 220%, 대상 trigger_defender, 확률 80%
    c.status(0);   // 위협, 대상 trigger_defender, 2턴
  },
});
