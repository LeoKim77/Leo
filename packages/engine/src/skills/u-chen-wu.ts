// 무외의 경지 · 고유 전법 · 액티브 45%
// 원문: 1턴 동안 준비 후 1턴 동안 자신의 무력이 30포인트 증가하며, 이후 전체 적군에게 260%~300%의 병기 피해를 준다.
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-chen-wu",
  name: "무외의 경지",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "260%~300% 는 시전마다 그 범위에서 무작위(분포 검증 대기)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 1턴 동안 자신의 무력이 30포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "이후 전체 적군에게 260%~300%의 병기 피해를 준다",
      "status": "approx"
    }
  ],
  def: {
    "prepTurns": 1,
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.6,
          "max": 3,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": 30,
          "max": 30,
          "target": "self",
          "duration": 1,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "260%~300% 는 시전마다 그 범위에서 무작위(분포 검증 대기)",
    "replacedLegacy": false
  },
  run(c) {
    // 「1턴 동안 준비 후 1턴 동안 자신의 무력이 30포인트 증가하며」
    c.statMod(0);
    // 「이후 전체 적군에게 260%~300%의 병기 피해를 준다」 — 시전마다 260~300% 에서 무작위(5% 단위)
    const r = c.pick([2.6, 2.7, 2.8, 2.9, 3.0]) as number;
    c.damage({ ...c.skill.effects.damage[0], min: r, max: r });
  },
});
