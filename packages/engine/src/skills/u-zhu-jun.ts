// 포위의 허점 · 고유 전법 · 액티브 70%
// 원문(시즌3 미리보기 2026-10-07): 2턴 동안 랜덤 적군 2명의 통솔(지력의 영향 받음)을 26포인트 탈취하고, 자신과 통솔이 가장 높은 우군에게 균등히 부여한다. 이후 180%의 책략 피해를 준다(통솔 차이의 영향을 추가로 받음).
// 원문 절 구현: approx / ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhu-jun",
  name: "포위의 허점",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 포위의 허점, 해외 번역 문구를 한국판 원문으로 교체"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "지력·통솔 차이 영향 미반영. 탈취한 통솔은 자신과 통솔 최고 아군에게 각 26(같은 무장이면 1회)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "2턴 동안 랜덤 적군 2명의 통솔(지력의 영향 받음)을 26포인트 탈취하고",
      "status": "approx"
    },
    {
      "text": "자신과 통솔이 가장 높은 우군에게 균등히 부여한다",
      "status": "ok"
    },
    {
      "text": "이후 180%의 책략 피해를 준다(통솔 차이의 영향을 추가로 받음)",
      "status": "approx"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.8,
          "max": 1.8,
          "target": "tag:e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": -26,
          "max": -26,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "e"
        },
        {
          "stat": "통솔",
          "min": 26,
          "max": 26,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "통솔",
          "min": 26,
          "max": 26,
          "target": "highest_command_ally",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "지력·통솔 차이 영향 미반영. 탈취한 통솔은 자신과 통솔 최고 아군에게 각 26(같은 무장이면 1회)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 통솔 -26, 대상 random_enemy_n, 2턴, 최대 1중첩
    c.statMod(1);   // 통솔 26, 대상 self, 2턴, 최대 1중첩
    c.statMod(2);   // 통솔 26, 대상 highest_command_ally, 2턴, 최대 1중첩
    c.damage(0);   // 책략 180%, 대상 tag:e
  },
});
