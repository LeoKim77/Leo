// 허실 간파 · 전법 · 액티브 45%
// 원문: 무작위 적군 2명의 지력과 통솔을 20만큼 빼앗아 2턴 지속시키고(지력 영향), 140% 책략 피해를 줍니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "see-truth",
  name: "허실 간파",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-05",
      "note": "녹화 확인: 목표별 [빼앗기 → 자신 증가(목표마다 1스택, 최대 2) → 피해] 순서, 지력 영향 반영"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 빼앗은 지력·통솔은 자신에게 +20씩. 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "무작위 적군 2명의 지력과 통솔을 20만큼 빼앗아 2턴 지속시키고(지력 영향)",
      "status": "ok"
    },
    {
      "text": "140% 책략 피해를 줍니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "tag:e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "지력",
          "min": -20,
          "max": -20,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "e"
        },
        {
          "stat": "통솔",
          "min": -20,
          "max": -20,
          "target": "tag:e",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "지력",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "통솔",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 빼앗은 지력·통솔은 자신에게 +20씩. 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 녹화 확인(2026-10-05): 목표마다 [지력·통솔 빼앗기 → 내 지력·통솔 증가 → 140% 책략] 순서. 두 번째 목표는 늘어난 지력으로 계산
    const E = c.skill.effects;
    const inf = { stats: ['지력'], who: 'self' };
    c.targets('random_enemy_n').forEach((u, i) => {
      if (!u.alive) return;
      c.tag('e' + i, [u]);
      // 「무작위 적군 2명의 지력과 통솔을 20만큼 빼앗아 2턴 지속시키고(지력 영향)」
      c.statMod({ ...E.statMods[0], target: 'tag:e' + i, tag: undefined, inf });
      c.statMod({ ...E.statMods[1], target: 'tag:e' + i, inf });
      c.statMod({ ...E.statMods[2], maxStacks: 2, inf });
      c.statMod({ ...E.statMods[3], maxStacks: 2, inf });
      // 「140% 책략 피해를 줍니다」
      c.damage({ ...E.damage[0], target: 'tag:e' + i });
    });
  },
});
