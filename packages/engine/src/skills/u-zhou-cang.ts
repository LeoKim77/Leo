// 충성과 용맹 · 고유 전법 · 패시브 100%
// 원문: 매 턴 행동 시 자신의 병력을 회복한다(치유율 200%, 지력과 통솔의 영향 받음). 45% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 조롱 및 위협 상태를 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhou-cang",
  name: "충성과 용맹",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-10",
      "note": "녹화(2026-10-10 조조·소교·등애): 지력과 통솔의 영향 회복은 지력 가산항 없이 지력 × 1.123 × 치유율 (FIX-029)"
    },
    {
      "date": "2026-10-04",
      "note": "회복 대상을 자신으로(예전엔 병력 최저 아군), 조롱·위협이 같은 랜덤 적 2명에게"
    }
  ],
  clauses: [
    {
      "text": "매 턴 행동 시 자신의 병력을 회복한다(치유율 200%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    },
    {
      "text": "45% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 조롱 및 위협 상태를 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_48",
    "legacyName": "충성과 용맹",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시 자신의 병력을 회복한다(치유율 100%→200%, 지력과 통솔의 영향 받음). 22.5%→45% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 조롱 및 위협 상태를 부여한다.",
    "effects": {
      "heal": [
        {
          "noStatTerm": true,
          "min": 1,
          "max": 2,
          "target": "self"
        }
      ],
      "statusEffects": [
        {
          "name": "위협",
          "target": "tag:two",
          "chance": 0.45,
          "chanceOnce": true,
          "duration": 2
        },
        {
          "name": "조롱",
          "target": "tag:two",
          "chance": 0.45,
          "chanceOnce": true,
          "duration": 2
        }
      ],
      "targets": [
        "random_enemy_n",
        "self"
      ]
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "매 턴 행동 시 자신의 병력을 회복한다(치유율 100%→200%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력과 통솔의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "22.5%→45% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 조롱 및 위협 상태를 부여한다",
        "impl": [
          "statusEffects[0]",
          "statusEffects[1]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "확률 순서 감사 S10",
      "reason": "원문 'N% 확률로 [대상]에게 …' — 확률이 대상 앞이라 시전 1회 판정, 성공 시 대상 전원(R-021). 대상마다 따로 굴리던 것을 고침 — 조롱 및 위협은 같은 판정 공유"
    }
  },
  run(c) {
    // 「매 턴 행동 시 자신의 병력을 회복한다(치유율 200%, 지력과 통솔의 영향 받음)」
    c.heal(0);
    // 「45% 확률로 랜덤 적군 2명에게 2턴 동안 지속되는 조롱 및 위협 상태를 부여한다」
    c.tag('two', c.targets('random_enemy_n'));
    c.status(1); c.status(0);   // 45% 판정 1번 공유
  },
});
