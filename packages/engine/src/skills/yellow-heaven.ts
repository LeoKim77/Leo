// 황천의 선동 · 전법 · 액티브 55%
// 원문: 적군 전체에게 140%의 책략 피해를 입히고, 요술 상태를 부여합니다. 지속시간은 2턴입니다. 대상이 이미 요술 상태를 보유하고 있다면, 추가로 대상이 가하는 피해를 16% 감소시킵니다. 지속시간은 1턴입니다.
// 원문 절 구현: ok / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "yellow-heaven",
  name: "황천의 선동",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 전체에게 140%의 책략 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "요술 상태를 부여합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 2턴입니다",
      "status": "ok"
    },
    {
      "text": "대상이 이미 요술 상태를 보유하고 있다면",
      "status": "ok"
    },
    {
      "text": "추가로 대상이 가하는 피해를 16% 감소시킵니다",
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
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.16,
          "max": -0.16,
          "target": "all_enemy",
          "duration": 1,
          "maxStacks": 1,
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "요술"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "요술",
          "target": "all_enemy",
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
    c.damage(0);   // 책략 140%, 대상 all_enemy
    c.buff(0);   // 주는피해 -16%, 대상 all_enemy, 1턴, 최대 1중첩, 조건 hasStatus
    c.status(0);   // 요술, 대상 all_enemy, 2턴
  },
});
