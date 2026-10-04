// 일심협력 · 전법 · 지휘 100%
// 원문: 매 턴 행동 시, 자신과 랜덤 우군 1명의 병력을 회복한다(치유율 90%, 지력과 통솔의 영향 받음).
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "same-boat",
  name: "일심협력",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "한국판 문구·수치는 게임 캡처로 확인(10레벨 치유율 90%, 2026-10-04). 통솔 영향은 회복 공식(지력 기준)상 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 행동 시, 자신과 랜덤 우군 1명의 병력을 회복한다(치유율 90%, 지력과 통솔의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "action",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.9,
          "max": 0.9,
          "target": "self"
        },
        {
          "min": 0.9,
          "max": 0.9,
          "target": "random_ally_1"
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "한국판 문구·수치는 게임 캡처로 확인(10레벨 치유율 90%, 2026-10-04). 통솔 영향은 회복 공식(지력 기준)상 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.heal(0);   // 치유율 90%, 대상 self
    c.heal(1);   // 치유율 90%, 대상 random_ally_1
  },
});
