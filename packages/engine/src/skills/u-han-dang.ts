// 명사수 · 고유 전법 · 패시브 100%
// 원문: 우군이 일반 공격한 후, 자신은 35% 확률로 아군의 공격 목표에게 추가로 일반 공격을 1회 부여한다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-han-dang",
  name: "명사수",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "우군(자신 제외)의 일반 공격 피해 1회마다 35% 판정, 그 목표에게 한당의 일반 공격 1회",
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
      "text": "우군이 일반 공격한 후, 자신은 35% 확률로 아군의 공격 목표에게 추가로 일반 공격을 1회 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "damage",
      "role": "ally_dealt",
      "chance": 1
    },
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "trigger_defender",
          "asBasicAttack": true
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
    "authoredNote": "우군(자신 제외)의 일반 공격 피해 1회마다 35% 판정, 그 목표에게 한당의 일반 공격 1회",
    "replacedLegacy": false
  },
  run(c) {
    // 「우군이 일반 공격한 후, 자신은 35% 확률로 아군의 공격 목표에게 추가로 일반 공격을 1회 부여한다」
    const e = c.eventCtx;
    if (!e || !e.isBasic || e.attacker === c.unit || !e.attacker.inBasicPhase || !e.defender || !e.defender.alive) return;
    const key = c.turn + ':' + e.attacker.id + ':' + (e.attacker._basicSeq || 0);
    if (c.unit._sharpshot === key) return;   // 일반 공격 1회당 판정 1번
    c.unit._sharpshot = key;
    if (c.chance(0.35)) c.damage(0);
  },
});
