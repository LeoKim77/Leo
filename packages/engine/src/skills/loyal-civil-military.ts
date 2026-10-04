// 문무의 충신 · 전법 · 추격 40%
// 원문: 일반 공격 후, 적군 중 지력이 가장 낮은 단일 대상에게 160%의 책략 피해를 입히고, 적군 중 통솔이 가장 낮은 단일 대상에게 160%의 병기 피해를 입힙니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "loyal-civil-military",
  name: "문무의 충신",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 적군 중 지력이 가장 낮은 단일 대상에게 160%의 책략 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "적군 중 통솔이 가장 낮은 단일 대상에게 160%의 병기 피해를 입힙니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "lowest_intel_enemy"
        },
        {
          "dmgType": "병기",
          "min": 1.6,
          "max": 1.6,
          "target": "lowest_control_enemy"
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
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 160%, 대상 lowest_intel_enemy
    c.damage(1);   // 병기 160%, 대상 lowest_control_enemy
  },
});
