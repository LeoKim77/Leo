// 인재 기용 · 전법 · 지휘 100%
// 원문: 3번째 턴부터 우군 2명은 매 턴 80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며, 해당 회심 또는 묘책 피해가 40% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "choose-momentum",
  name: "인재 기용",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "확정 회심과 회심 피해 +40%를 같은 대상의 같은 1회 피해에 묶음(예전엔 따로 뽑은 대상에게 1턴 회심피해)"
    }
  ],
  clauses: [
    {
      "text": "3번째 턴부터 우군 2명은 매 턴 80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며",
      "status": "ok",
      "reviewed": "확정 회심/묘책 1회. 우군 2명 매 턴 80%"
    },
    {
      "text": "해당 회심 또는 묘책 피해가 40% 증가한다",
      "status": "ok",
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
          "target": "random_friend_n",
          "cap": 1,
          "critBonus": 0.4
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
    // 「3번째 턴부터 우군 2명은 매 턴 80% 확률로 다음 피해에 회심 또는 묘책(이)가 반드시 발동되며」
    // 「해당 회심 또는 묘책 피해가 40% 증가한다」
    c.buff(0);   // 우군 2명(자신 제외), 대상마다 80%: 다음 피해 회심·묘책 확정 + 그 피해 +40%
  },
});
