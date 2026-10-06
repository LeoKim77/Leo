// 전장 평정 · 고유 전법 · 추격 55%
// 원문: 일반 공격 후, 2턴 동안 공격 목표의 선공과 무력을 24 감소시킨다(무력의 영향 받음). 이후 디버프 상태를 보유한 적군 목표에게 180%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huang-zhong",
  name: "전장 평정",
  kind: "추격",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "능력치 감소에 무력 영향 반영"
    },
    {
      "date": "2026-10-06",
      "note": "녹화(2026-10-06): 180% 피해는 공격 목표만이 아니라 디버프를 가진 적군 전원(손책·견희 2명 동시 피격)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 공격 목표의 선공과 무력을 24 감소시킨다(무력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "이후 디버프 상태를 보유한 적군 목표에게 180%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_32",
    "legacyName": "전장 평정",
    "legacyType": "추격",
    "legacyProcRate": "55%",
    "raw": "일반 공격 후, 2턴 동안 공격 목표의 선공과 무력을 12→24 감소시킨다(무력의 영향 받음). 이후 디버프 상태를 보유한 적군 목표에게 90%→180%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.9,
          "max": 1.8,
          "target": "all_enemy",
          "condition": {
            "type": "hasAnyDebuff",
            "who": "target"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "선공",
          "min": -24,
          "max": -24,
          "target": "trigger_defender",
          "duration": 2,
          "inf": {
            "stats": [
              "무력"
            ],
            "who": "self"
          }
        },
        {
          "stat": "무력",
          "min": -24,
          "max": -24,
          "target": "trigger_defender",
          "duration": 2,
          "inf": {
            "stats": [
              "무력"
            ],
            "who": "self"
          }
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "preciseApplied": true,
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "chance": 0.55
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 공격 목표의 선공과 무력을 12→24 감소시킨다(무력의 영향 받음)",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "디버프 상태를 보유한 적군 목표에게 90%→180%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 S09 / 절 검토",
      "reason": "레벨 보간이 뒤집혀 24가 아니라 12만 감소했다."
    }
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 선공 -24, 대상 trigger_defender, 2턴
    c.statMod(1);   // 무력 -24, 대상 trigger_defender, 2턴
    // 「이후 디버프 상태를 보유한 적군 목표에게 180%의 병기 피해를 준다」
    c.damage(0);   // 병기 90%→180%, 대상 trigger_defender, 조건 hasAnyDebuff
  },
});
