// 준비 완료 · 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 우군 2명의 주는 피해가 7% 증가하며, 중첩될 수 있고, 전투 종료까지 지속된다.
// 원문 절 구현: ok / note / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ready",
  name: "준비 완료",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "매 턴 시작 시, 우군 2명의 주는 피해가 7% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "중첩될 수 있고",
      "status": "note"
    },
    {
      "text": "전투 종료까지 지속된다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "skill_6",
    "legacyName": "준비 완료",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 시작 시, 우군 2명의 주는 피해가 3.5%→7% 증가하며, 중첩될 수 있고, 전투 종료까지 지속된다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.035,
          "max": 0.07,
          "duration": 999,
          "maxStacks": 8
        }
      ],
      "statMods": [],
      "targets": [
        "random_friend_n"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "매 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "우군 2명의 주는 피해가 3.5%→7% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "중첩될 수 있고",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전투 종료까지 지속된다",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "사용자 게임 캡처 (전법 검색 '우군'·'아군', 2026-10-04) — R-034",
      "reason": "게임 문구 '우군 2명' = 자신 제외"
    }
  },
  run(c) {
    // 「매 턴 시작 시, 우군 2명의 주는 피해가 7% 증가하며」
    c.buff(0);   // 주는피해 +3.5%→7%, 전투 종료까지, 최대 8중첩
  },
});
