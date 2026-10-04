// 현묘한계책 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작시, 90% 확률로 랜덤 적군 단일 목표와 우군 1명에게 2턴 동안 지속되는 혼란을 부여한다. 적군 목표가 이미 혼란 상태일 경우, 추가로 300%의 책략 피해를 준다. 우군 목표가 이미 혼란 상태일 경우, 추가로 해당 목표와 자신의 병력을 회복한다. (치유율 110% 지력의 영향 받음)
// 원문 절 구현: ok / ok / missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-jia-xu",
  name: "현묘한계책",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "90% 판정이 대상별, \"우군이 이미 혼란이면 회복\" 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 시작시, 90% 확률로 랜덤 적군 단일 목표와 우군 1명에게 2턴 동안 지속되는 혼란을 부여한다",
      "status": "ok"
    },
    {
      "text": "적군 목표가 이미 혼란 상태일 경우, 추가로 300%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "우군 목표가 이미 혼란 상태일 경우, 추가로 해당 목표와 자신의 병력을 회복한다",
      "status": "missing"
    },
    {
      "text": "(치유율 110% 지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 3,
          "max": 3,
          "target": "random_enemy_1",
          "tag": "e",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "혼란"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:e",
          "chance": 0.9,
          "duration": 2
        },
        {
          "name": "혼란",
          "target": "random_ally_1",
          "chance": 0.9,
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "90% 판정이 대상별, \"우군이 이미 혼란이면 회복\" 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 300%, 대상 random_enemy_1, 조건 hasStatus
    c.status(0);   // 혼란, 대상 tag:e, 확률 90%, 2턴
    c.status(1);   // 혼란, 대상 random_ally_1, 확률 90%, 2턴
  },
});
