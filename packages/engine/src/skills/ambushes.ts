// 퇴로 매복 · 전법 · 액티브 50%
// 원문(게임 10레벨 캡처 2026-10-07): 랜덤 적군 단일 목표에게 110%의 병기 피해를 주며, 4회 발동된다. 발동 기간 동안 25%의 회심 확률이 적용된다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ambushes",
  name: "퇴로 매복",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'100%~140%' 는 타격마다 무작위 계수 (예전엔 항상 140%)"
    },
    {
      "date": "2026-10-06",
      "note": "녹화(2026-10-06): 시전 중 자신의 회심 확률 +25%(「퇴로 매복-폭」, 4타가 끝나면 사라짐) — 엑셀 원문에 없는 문장이라 근사, 게임 원문 확인 요청"
    },
    {
      "date": "2026-10-07",
      "note": "게임 원문 캡처(10레벨): '110%의 병기 피해, 4회. 발동 기간 동안 25%의 회심 확률' — 100%~140% 무작위 폭을 110% 고정으로 고침(녹화 손책 4타 559·556·530 이 화하 진압 180% 대비 110% 와 일치), 회심 +25% 확정(R-053)"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 110%의 병기 피해를 주며",
      "status": "ok",
      "reviewed": "4회 타격, 타격마다 랜덤 적 1명, 110%(10레벨)"
    },
    {
      "text": "4회 발동된다",
      "status": "ok"
    },
    {
      "text": "발동 기간 동안 25%의 회심 확률이 적용된다",
      "status": "ok",
      "reviewed": "시전 동안 회심 +25%, 4타 뒤 해제 (R-053)"
    }
  ],
  def: {
    "legacyId": "skill_18",
    "legacyName": "퇴로 매복",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "랜덤 적군 단일 목표에게 55%→110%의 병기 피해를 주며, 4회 발동된다. 발동 기간 동안 25%의 회심 확률이 적용된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.55,
          "max": 1.1,
          "target": "random_enemy_1"
        },
        {
          "dmgType": "병기",
          "min": 0.55,
          "max": 1.1,
          "target": "random_enemy_1"
        },
        {
          "dmgType": "병기",
          "min": 0.55,
          "max": 1.1,
          "target": "random_enemy_1"
        },
        {
          "dmgType": "병기",
          "min": 0.55,
          "max": 1.1,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 50%→100%~70%→140%의 병기 피해를 주며",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "4회 발동된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「발동 기간 동안 25%의 회심 확률이 적용된다」 — 전보 「퇴로 매복-폭」, 4타 뒤 사라짐 (R-053)
    const mods = c.unit.mods || (c.unit.mods = {});
    mods.회심 = (mods.회심 || 0) + 0.25;
    try {
      // 「랜덤 적군 단일 목표에게 110%의 병기 피해를 주며」「4회 발동된다」
      c.damage(0); c.damage(1); c.damage(2); c.damage(3);
    } finally { mods.회심 -= 0.25; }
  },
});
