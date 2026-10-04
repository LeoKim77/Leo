// 화소연영 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표에게 2턴 동안 지속되는 화공을 부여한다. 이후 화공 상태를 보유한 적군 목표에게 2턴 동안 지속되는 연소 상태를 1스택 부여하며, 220%의 책략피해를 주고, 40%확률로 (지력의 영향 받음) 추가로 1스택의 연소 상태를 부여한다.
// 원문 절 구현: ok / missing / ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lu-xun",
  name: "화소연영",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "연소 상태(지속 피해)는 미지원. 화공 부여 후 화공 보유 적에게 220% 책략 피해",
    "source": "authored"
  },
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 2턴 동안 지속되는 화공을 부여한다",
      "status": "ok"
    },
    {
      "text": "이후 화공 상태를 보유한 적군 목표에게 2턴 동안 지속되는 연소 상태를 1스택 부여하며",
      "status": "missing"
    },
    {
      "text": "220%의 책략피해를 주고",
      "status": "ok"
    },
    {
      "text": "40%확률로 (지력의 영향 받음) 추가로 1스택의 연소 상태를 부여한다",
      "status": "missing"
    }
  ],
  def: {
    "statusFirst": true,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 2.2,
          "max": 2.2,
          "target": "all_enemy",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "화공"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "화공",
          "target": "random_enemy_1",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "연소 상태(지속 피해)는 미지원. 화공 부여 후 화공 보유 적에게 220% 책략 피해",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 화공, 대상 random_enemy_1, 2턴
    c.damage(0);   // 책략 220%, 대상 all_enemy, 조건 hasStatus
  },
});
