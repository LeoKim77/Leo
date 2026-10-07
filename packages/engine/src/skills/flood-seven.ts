// 칠군수몰 · 전법 · 액티브 40%
// 원문(도감 2026-10-07): 1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여한다. 그리고 260%의 병기 피해를 주며, 65%의 확률로 1턴 동안 지속되는 침묵 및 무장 해제 상태를 부여한다. 각 상태는 개별적으로 판정된다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "flood-seven",
  name: "칠군수몰",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S1 전설): \"침묵 또는 무장 해제 중 한 가지\" → \"65% 확률로 침묵 및 무장 해제, 각 상태 개별 판정\""
    },
    {
      "date": "2026-10-04",
      "note": "원문 순서: 홍수 2턴 → 260% → 침묵/무장 해제 중 1가지 1턴 (예전엔 피해 뒤 홍수, 무장 해제 2턴)"
    },
    {
      "date": "2026-10-05",
      "note": "녹화 확인: 목표별 [홍수 → 피해 → 침묵/무장 해제] 순서"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여한다",
      "status": "ok",
      "impl": [
        "prepTurns",
        "statusEffects[1]"
      ]
    },
    {
      "text": "그리고 260%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "65%의 확률로 1턴 동안 지속되는 침묵 및 무장 해제 상태를 부여한다",
      "status": "ok",
      "reviewed": "침묵 65%·무장 해제 65% 목표마다 따로 판정"
    },
    {
      "text": "각 상태는 개별적으로 판정된다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_12",
    "legacyName": "칠군수몰",
    "legacyType": "액티브",
    "legacyProcRate": "40%",
    "raw": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여한다. 그리고 130%→260%의 병기 피해를 주며, 32.5%→65%의 확률로 1턴 동안 지속되는 침묵 및 무장 해제 상태를 부여한다. 각 상태는 개별적으로 판정된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.3,
          "max": 2.6
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy"
      ],
      "statusEffects": [
        {
          "name": "홍수",
          "target": "all_enemy",
          "duration": 2
        },
        {
          "name": "침묵",
          "target": "all_enemy",
          "duration": 1,
          "chance": 0.65
        },
        {
          "name": "무장 해제",
          "target": "all_enemy",
          "duration": 1,
          "chance": 0.65
        }
      ]
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여",
        "impl": [
          "prepTurns",
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "130%→260%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 동안 지속되는 침묵 또는 무장 해제 중 한 가지를 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 D06-targets",
      "reason": "원문 '적군 전체에게 … 260%의 병기 피해' 인데 대상 코드가 비어 있어 랜덤 1명만 맞았다."
    }
  },
  run(c) {
    // 녹화 확인(2026-10-05): 목표마다 [홍수 → 260% 병기 → 침묵/무장 해제] 후 다음 목표
    const E = c.skill.effects;
    c.targets('all_enemy').forEach((u, i) => {
      if (!u.alive) return;
      c.tag('f' + i, [u]);
      // 「1턴 동안 준비 후 적군 전체에게 2턴 동안 지속되는 홍수을(를) 부여하고」
      c.status({ ...E.statusEffects[0], target: 'tag:f' + i });
      // 「260%의 병기 피해를 주며」
      if (u.alive) c.damage({ ...E.damage[0], target: 'tag:f' + i });
      // 「65%의 확률로 1턴 동안 지속되는 침묵 및 무장 해제 상태를 부여한다. 각 상태는 개별적으로 판정된다」
      if (u.alive) c.status({ ...E.statusEffects[1], target: 'tag:f' + i });
      if (u.alive) c.status({ ...E.statusEffects[2], target: 'tag:f' + i });
    });
  },
});
