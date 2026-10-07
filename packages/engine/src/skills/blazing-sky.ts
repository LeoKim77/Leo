// 맹렬한 화염 · 전법 · 액티브 50%
// 원문(도감 2026-10-07): 전체 적군에게 2턴 동안 지속되는 화공을(를) 부여하며, 90%의 책략과 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "blazing-sky",
  name: "맹렬한 화염",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 책략·병기 각 50% → 90%"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준(수치 레벨 확인 필요)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전체 적군에게 2턴 동안 지속되는 화공을(를) 부여하며",
      "status": "ok"
    },
    {
      "text": "90%의 책략과 병기 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "statusFirst": true,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.9,
          "max": 0.9,
          "target": "all_enemy"
        },
        {
          "dmgType": "병기",
          "min": 0.9,
          "max": 0.9,
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
    // 「전체 적군에게 2턴 동안 지속되는 화공을(를) 부여하며」
    c.status(0);
    // 「90%의 책략과 병기 피해를 준다」
    c.damage(0);   // 책략 90%
    c.damage(1);   // 병기 90%
  },
});
