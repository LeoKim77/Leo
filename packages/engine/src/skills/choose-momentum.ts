// 인재 기용 · 전법 · 지휘 100%
// 원문: 3번째 턴부터 우군 2명은 매 턴 80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며, 해당 회심 또는 묘책 피해가 40% 증가한다.
// 원문 절 구현: approx / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "choose-momentum",
  name: "인재 기용",
  kind: "지휘",
  isUnique: false,
  clauses: [
    {
      "text": "3번째 턴부터 우군 2명은 매 턴 80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며",
      "status": "approx",
      "reviewed": "확정 회심/묘책 1회. 우군 2명 매 턴 80%"
    },
    {
      "text": "해당 회심 또는 묘책 피해가 40% 증가한다",
      "status": "approx",
      "reviewed": "회심/묘책 피해 +40%를 1턴 버프로"
    }
  ],
  def: {
    "legacyId": "skill_7",
    "legacyName": "인재 기용",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "3번째 턴부터 우군 2명은 매 턴 40%→80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며, 해당 회심 또는 묘책 피해가 20%→40% 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "확정회심",
          "min": 1,
          "max": 1,
          "chance": 0.8,
          "target": "random_friend_n"
        },
        {
          "stat": "회심피해",
          "min": 0.2,
          "max": 0.4,
          "target": "random_friend_n",
          "duration": 1,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_friend_n"
      ],
      "statusEffects": []
    },
    "onlyTurns": [
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "manualOverride": true,
    "clauses": [
      {
        "text": "3번째 턴부터 우군 2명은 매 턴 40%→80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "해당 회심 또는 묘책 피해가 20%→40% 증가한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "사용자 게임 캡처 (전법 검색 '우군'·'아군', 2026-10-04) — R-034",
      "reason": "게임 문구 '우군 2명' = 자신 제외"
    }
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 확정회심 +100%, 대상 random_friend_n, 확률 80%
    c.buff(1);   // 회심피해 +20%→40%, 대상 random_friend_n, 1턴, 최대 1중첩
  },
});
