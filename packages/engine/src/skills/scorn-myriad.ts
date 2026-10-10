// 만군 멸시 · 전법 · 추격 40%
// 원문(시즌3 미리보기 2026-10-07): 일반 공격 후, 전체 적군에게 140%의 병기 피해를 준다. 짝수 턴에 발동 시, 추가로 병력이 가장 낮은 적군 단일 목표에게 100%의 병기 피해를 준다. 이전 턴에 발동되지 않았으면 이번 전법 피해가 50% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "scorn-myriad",
  name: "만군 멸시",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 해외 번역 문구를 한국판 원문으로 교체"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 전체 적군에게 140%의 병기 피해를 준다",
      "status": "ok"
    },
    {
      "text": "짝수 턴에 발동 시, 추가로 병력이 가장 낮은 적군 단일 목표에게 100%의 병기 피해를 준다",
      "status": "ok"
    },
    {
      "text": "이전 턴에 발동되지 않았으면 이번 전법 피해가 50% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 1.4,
          "target": "all_enemy",
          "idleBonus": 0.5
        },
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "lowest_hp_enemy",
          "turnCond": {
            "parity": "even"
          },
          "idleBonus": 0.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 140%, 대상 all_enemy
    c.damage(1);   // 병기 100%, 대상 lowest_hp_enemy
  },
});
