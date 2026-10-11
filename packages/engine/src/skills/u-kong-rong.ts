// 격렬한 언사 · 고유 전법 · 액티브 50%
// 원문: 지력이 가장 높은 적군 단일 목표를 2턴 동안 조롱하며, 우군 랜덤 1명이 해당 상대에게 160%의 병기 피해와 책략 피해를 준다. 이후 해당 우군의 병력을 회복시킨다(치유율 140%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-kong-rong",
  name: "격렬한 언사",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "조롱 대상에게 우군(자신 제외) 1명이 자기 스탯으로 160% 병기·책략, 이후 그 우군 회복(공융 지력)",
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
      "text": "지력이 가장 높은 적군 단일 목표를 2턴 동안 조롱하며",
      "status": "ok"
    },
    {
      "text": "우군 랜덤 1명이 해당 상대에게 160%의 병기 피해와 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "이후 해당 우군의 병력을 회복시킨다(치유율 140%, 지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.6,
          "max": 1.6,
          "target": "tag:e",
          "actor": "tag:f"
        },
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "tag:e",
          "actor": "tag:f"
        }
      ],
      "heal": [
        {
          "min": 1.4,
          "max": 1.4,
          "target": "tag:f"
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "조롱",
          "target": "tag:e",
          "duration": 2,
          "tag": "e"
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "조롱 대상에게 우군(자신 제외) 1명이 자기 스탯으로 160% 병기·책략, 이후 그 우군 회복(공융 지력)",
    "replacedLegacy": false
  },
  run(c) {
    // 「지력이 가장 높은 적군 단일 목표를 2턴 동안 조롱하며」
    const e = c.tag('e', c.targets('highest_intel_enemy'));
    if (!e.length) return;
    c.status(0);
    // 「우군 랜덤 1명이 해당 상대에게 160%의 병기 피해와 책략 피해를 준다」 — 공격자는 그 우군(자신의 스탯)
    const f = c.tag('f', [c.pick(c.friendsOf(c.unit))]);
    if (!f.length) return;
    c.damage(0);
    c.damage(1);
    // 「이후 해당 우군의 병력을 회복시킨다(치유율 140%, 지력의 영향 받음)」
    c.heal(0);
  },
});
