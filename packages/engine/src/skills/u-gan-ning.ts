// 수전의 제왕 · 고유 전법 · 패시브 100%
// 원문: 일반 공격 피해가 150% 증가하며, 일반 공격 전, 2턴 동안 자신의 무력이 12포인트 증가한다. 4회 중첩될 수 있다.
// 원문 절 구현: ok / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-gan-ning",
  name: "수전의 제왕",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "일반 공격 피해가 150% 증가하며",
      "status": "ok",
      "reviewed": "주는일반공격피해 +150%"
    },
    {
      "text": "일반 공격 전, 2턴 동안 자신의 무력이 12포인트 증가한다",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "4회 중첩될 수 있다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "uskill_21",
    "legacyName": "수전의 제왕",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "일반 공격 피해가 75%→150% 증가하며, 일반 공격 전, 2턴 동안 자신의 무력이 6→12포인트 증가한다. 4회 중첩될 수 있다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는일반공격피해",
          "min": 0.75,
          "max": 1.5,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [
        {
          "stat": "무력",
          "min": 6,
          "max": 12,
          "duration": 2,
          "maxStacks": 4
        }
      ],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 피해가 75%→150% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "일반 공격 전",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 자신의 무력이 6→12포인트 증가한다",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "4회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「일반 공격 전, 2턴 동안 자신의 무력이 12포인트 증가한다」
    c.statMod(0);   // 무력 6→12, 2턴, 최대 4중첩
    c.buff(0);   // 주는일반공격피해 +75%→150%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
