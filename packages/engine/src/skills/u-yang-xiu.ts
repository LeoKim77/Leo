// 민첩한 대응 · 고유 전법 · 지휘 100%
// 원문: 적군 전체가 액티브 전법 발동 후, 적에게 50%의 책략 피해를 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yang-xiu",
  name: "민첩한 대응",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "적군의 액티브 발동마다 그 시전자에게 50% 책략",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "적군 전체가 액티브 전법 발동 후, 적에게 50%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "cast",
      "castType": "액티브",
      "role": "enemy_side",
      "chance": 1
    },
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 0.5,
          "target": "trigger_attacker"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "적군의 액티브 발동마다 그 시전자에게 50% 책략",
    "replacedLegacy": false
  },
  run(c) {
    // 「적군 전체가 액티브 전법 발동 후, 적에게 50%의 책략 피해를 준다」 — 그 액티브를 쓴 적에게
    c.damage(0);
  },
});
