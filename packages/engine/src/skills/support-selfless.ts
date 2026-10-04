// 전력 지원 · 전법 · 패시브 100%
// 원문: 자신이 피해를 받기 직전, 50% 확률로 우군 2명의 병력을 회복시킨다(치유율 50%, 지력과 통솔의 영향 받음).
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "support-selfless",
  name: "전력 지원",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "자신이 피해를 받기 직전, 50% 확률로 우군 2명의 병력을 회복시킨다(치유율 50%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_72",
    "legacyName": "전력 지원",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신이 피해를 받기 직전, 50% 확률로 우군 2명의 병력을 회복시킨다(치유율 25%→50%, 지력과 통솔의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.25,
          "max": 0.5,
          "chance": 0.5,
          "chanceOnce": true,
          "target": "random_friend_n"
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_ally_n"
      ],
      "statusEffects": []
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "자신이 피해를 받기 직전",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "50% 확률로 우군 2명의 병력을 회복시킨다(치유율 25%→50%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력과 통솔의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "trigger": {
      "event": "damage",
      "role": "taken",
      "chance": 0.5
    },
    "overrideNote": {
      "date": "2026-10-04",
      "found": "확률 순서 감사 S10 (사용자 지적: 난공불락)",
      "reason": "원문 'N% 확률로 [대상]에게 …' — 확률이 대상 앞이라 시전 1회 판정, 성공 시 대상 전원(R-021). 대상마다 따로 굴리던 것을 고침 / 게임 문구 '우군 2명' = 자신 제외(R-034)"
    }
  },
  run(c) {
    // 「자신이 피해를 받기 직전, 50% 확률로 우군 2명의 병력을 회복시킨다(치유율 50%, 지력과 통솔의 영향 받음)」
    c.heal(0);   // 치유율 25%→50%, 대상 random_friend_n, 확률 50%(1회 판정)
  },
});
