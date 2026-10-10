// 완벽한 사격 · 고유 전법 · 패시브 100%
// 원문: 매 턴 시작 시, 90% 확률로 축력 1스택을 획득한다. 축력: 일반 공격 성공 후, 모든 축력 스택을 소모하여 추가로 일반 공격을 시전한다(무장 해제 상태 무시, 일반 공격 횟수는 축력 스택수와 동일, 최대 10스택까지 중첩 가능). 자신이 일반 공격을 시전하기 전 이미 무장 해제 또는 일반 공격 불가 상태일 경우 90% 확률로 1스택의 축력을 획득한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-taishi-ci",
  name: "완벽한 사격",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "고유 전법 녹화: 축력 획득 확률 90%(예전 50% — 1레벨 값을 쓰고 있었음)"
    }
  ],
  clauses: [
    {
      "text": "매 턴 시작 시, 50% 확률로 축력 1스택 획득: 일반 공격 성공 후",
      "status": "ok",
      "reviewed": "charge_shot 특수 처리"
    },
    {
      "text": "모든 축력 스택수를 소모하여 추가로 일반 공격을 시전한다(무장 해제 상태 무시, 일반 공격 횟수는 축력 스택수와 동일, 최대 10스택까지 중첩 가능)",
      "status": "ok",
      "reviewed": "charge_shot 특수 처리"
    },
    {
      "text": "자신이 일반 공격을 시전하기 전 이미 무장 해제 또는 일반 공격 불가 상태일 경우 50% 확률로 1스택의 축력을 획득한다",
      "status": "ok",
      "reviewed": "charge_shot 특수 처리"
    }
  ],
  def: {
    "legacyId": "uskill_18",
    "legacyName": "완벽한 사격",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "매 턴 시작 시, 45%→50% 확률로 축력 1스택 획득: 일반 공격 성공 후, 모든 축력 스택수를 소모하여 추가로 일반 공격을 시전한다(무장 해제 상태 무시, 일반 공격 횟수는 축력 스택수와 동일, 최대 10스택까지 중첩 가능). 자신이 일반 공격을 시전하기 전 이미 무장 해제 또는 일반 공격 불가 상태일 경우 45%→50% 확률로 1스택의 축력을 획득한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "매 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "45%→50% 확률로 축력 1스택 획득: 일반 공격 성공 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "모든 축력 스택수를 소모하여 추가로 일반 공격을 시전한다(무장 해제 상태 무시",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "일반 공격 횟수는 축력 스택수와 동일",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "최대 10스택까지 중첩 가능)",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신이 일반 공격을 시전하기 전 이미 무장 해제 또는 일반 공격 불가 상태일 경우 45%→50% 확률로 1스택의 축력을 획득한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "special": "charge_shot",
    "chargeChance": 0.9,
    "chargeMax": 10
  },
  run(c) {
    // 실행할 효과 없음 (상시 효과·트리거·특수 처리만 있는 전법)
  },
});
