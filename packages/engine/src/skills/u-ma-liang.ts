// 흰눈썹 장군 · 고유 전법 · 액티브 40%
// 원문: 전체 적군에게 110%의 책략 피해를 주며, 2턴 동안 지속되는 위협을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ma-liang",
  name: "흰눈썹 장군",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "",
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
      "text": "전체 적군에게 110%의 책략 피해를 주며",
      "status": "ok"
    },
    {
      "text": "2턴 동안 지속되는 위협을(를) 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 1.1,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "위협",
          "target": "all_enemy",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「전체 적군에게 110%의 책략 피해를 주며」
    c.damage(0);
    // 「2턴 동안 지속되는 위협을(를) 부여한다」
    c.status(0);
  },
});
