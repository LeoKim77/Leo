// 기민한 전술 · 전법 · 액티브 40%
// 원문(도감 2026-10-07): 적군 랜덤 단일 목표에게 360%의 병기 피해를 주고, 자신이 다음에 시전하는 준비 전법이 준비를 1턴 건너뛴다. 건너뛰는 횟수는 중첩할 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "charge-change",
  name: "기민한 전술",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "준비 턴 생략 1회로 해석 (2026-10-04 함수 보정)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 문구 확정 — 준비 1턴 건너뜀, 건너뛰는 횟수 중첩(녹화 2026-10-06 「기민한 전술-준비」 +1 과 같음)"
    },
    {
      "date": "2026-10-04",
      "note": "다음 준비형 전법 준비 생략 구현('일정 횟수'는 1회로 해석)"
    }
  ],
  clauses: [
    {
      "text": "적군 랜덤 단일 목표에게 360%의 병기 피해를 주고",
      "status": "ok"
    },
    {
      "text": "자신이 다음에 시전하는 준비 전법이 준비를 1턴 건너뛴다",
      "status": "ok"
    },
    {
      "text": "건너뛰는 횟수는 중첩할 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 3.6,
          "max": 3.6,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "준비생략",
          "min": 1,
          "max": 1,
          "target": "self"
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "준비 턴 생략 1회로 해석 (2026-10-04 함수 보정)",
    "replacedLegacy": false
  },
  run(c) {
    // 「적군 랜덤 단일 목표에게 360%의 병기 피해를 주고」
    c.damage(0);
    // 「자신이 다음에 시전하는 준비 전법이 준비를 1턴 건너뛴다. 건너뛰는 횟수는 중첩할 수 있다」 — 준비생략 +1(누적)
    c.buff(0);
  },
});
