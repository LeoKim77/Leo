// 난공불락 · 전법 · 지휘 100%
// 원문(도감 2026-10-07): 자신의 통솔이 20% 증가하며, 2번째 턴부터 매 턴 시작 시, 60% 확률로(통솔의 영향 받음) 2턴 동안 랜덤 적군 2~3명을 조롱한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "solid-defense",
  name: "난공불락",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 통솔 +15% → +20%, 조롱 확률 60% 에 통솔 영향 반영(근사 → 구현)"
    }
  ],
  engineStatus: {
    "status": "ok",
    "note": "2번째 턴부터 매 턴 시작 60%(통솔 영향) 판정 1번 → 성공 시 랜덤 적군 2~3명 전원 조롱(R-021, R-020)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신의 통솔이 20% 증가하며",
      "status": "ok"
    },
    {
      "text": "2번째 턴부터 매 턴 시작 시, 60% 확률로(통솔의 영향 받음) 2턴 동안 랜덤 적군 2~3명을 조롱한다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "onlyTurns": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "조롱",
          "target": "random_enemy_2to3",
          "chance": 0.6,
          "duration": 2,
          "chanceOnce": true
        }
      ],
      "targets": []
    },
    "static": {
      "statsPct": {
        "통솔": 0.2
      }
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "\"도발\"=조롱. 2턴부터 매 턴 시작 60% 판정 1번 → 성공 시 랜덤 적군 2~3명 전원 조롱(R-021, R-020). 통솔 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신의 통솔이 20% 증가하며」 — def.static (포진 시 고정)
    // 「2번째 턴부터 매 턴 시작 시, 60% 확률로(통솔의 영향 받음) 2턴 동안 랜덤 적군 2~3명을 조롱한다」 — 판정 1번 → 전원
    const st = c.skill.effects.statusEffects[0];
    c.status({ ...st, chance: st.chance * c.infl('통솔') });
  },
});
