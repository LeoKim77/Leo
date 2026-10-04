// 태평여향 · 고유 전법 · 지휘 100%
// 원문: 아군 전체가 액티브 전법을 성공적으로 발동한 후, 자신이 80% 확률로 적군 무작위 2명에게 140%의 책략 피해를 입힙니다. 이 효과가 1회 발동할 때마다 해당 턴의 발동 확률이 10% 감소합니다. 적군이 요술 상태일 경우, 가한 피해량의 40%(지력의 영향을 받음)만큼 아군 중 병력이 가장 낮은 단일 대상의 병력을 회복합니다.
// 원문 절 구현: ok / ok / approx / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-ning",
  name: "태평여향",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "\"발동마다 그 턴 확률 10% 감소\"를 턴당 평균 70%로 처리. 요술 대상 피해량 40% 회복 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "아군 전체가 액티브 전법을 성공적으로 발동한 후",
      "status": "ok"
    },
    {
      "text": "자신이 80% 확률로 적군 무작위 2명에게 140%의 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "이 효과가 1회 발동할 때마다 해당 턴의 발동 확률이 10% 감소합니다",
      "status": "approx"
    },
    {
      "text": "적군이 요술 상태일 경우, 가한 피해량의 40%(지력의 영향을 받음)만큼 아군 중 병력이 가장 낮은 단일 대상의 병력을 회복합니다",
      "status": "missing"
    }
  ],
  def: {
    "trigger": {
      "event": "cast",
      "castType": "액티브",
      "role": "ally_side",
      "chance": 0.7,
      "maxPerTurn": 99
    },
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"발동마다 그 턴 확률 10% 감소\"를 턴당 평균 70%로 처리. 요술 대상 피해량 40% 회복 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 140%, 대상 random_enemy_n
  },
});
