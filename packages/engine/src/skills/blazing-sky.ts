// 맹렬한 화염 · 전법 · 액티브 50%
// 원문: 적군 전체에 화공 상태를 부여해 2턴 지속시키고, 각각 50%의 책략 피해와 병기 피해를 줍니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "blazing-sky",
  name: "맹렬한 화염",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준(수치 레벨 확인 필요)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 전체에 화공 상태를 부여해 2턴 지속시키고",
      "status": "ok"
    },
    {
      "text": "각각 50%의 책략 피해와 병기 피해를 줍니다",
      "status": "ok"
    }
  ],
  def: {
    "statusFirst": true,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 0.5,
          "target": "all_enemy"
        },
        {
          "dmgType": "병기",
          "min": 0.5,
          "max": 0.5,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "화공",
          "target": "all_enemy",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준(수치 레벨 확인 필요)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 화공, 대상 all_enemy, 2턴
    c.damage(0);   // 책략 50%, 대상 all_enemy
    c.damage(1);   // 병기 50%, 대상 all_enemy
  },
});
