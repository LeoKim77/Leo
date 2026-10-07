// 혼란의 폭우 · 고유 전법 · 액티브 55%
// 원문(시즌3 미리보기 2026-10-07): 전체 적군에게 120%의 책략 피해를 주고, 2턴 동안 지속되는 홍수 상태를 부여한다. 또한, 자신과 랜덤 우군 1명(같은 열 우선)이 아래 효과 중 1~2개를 획득한다. 효과: 자신의 병력 회복(치유율 200%, 지력의 영향 받음). 2턴 동안 침묵 상태 면역. 2턴 동안 액티브 전법 발동률 10% 증가. 무장마다 개별적으로 판정된다.
// 원문 절 구현: ok / ok / ok / approx / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yu-ji",
  name: "혼란의 폭우",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 혼란의 폭우. 효과 3종(회복 200%·2턴 침묵 면역·2턴 액티브 발동률 +10%) 중 1~2개를 자신과 랜덤 우군 1명(같은 열 우선)이 무장마다 따로 획득(예전: 효과마다 50%, 기궁 면역 누락, 지속 1턴)"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "효과 개수 1개/2개는 반반, 효과 고르기는 균등 무작위로 해석(원문에 확률 없음)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전체 적군에게 120%의 책략 피해를 주고",
      "status": "ok"
    },
    {
      "text": "2턴 동안 지속되는 홍수 상태를 부여한다",
      "status": "ok"
    },
    {
      "text": "또한",
      "status": "ok"
    },
    {
      "text": "자신과 랜덤 우군 1명(같은 열 우선)이 아래 효과 중 1~2개를 획득한다",
      "status": "ok",
      "reviewed": "무장마다 1개 또는 2개(반반)를 효과 3종에서 고름, 같은 열 우군 우선"
    },
    {
      "text": "효과: 자신의 병력 회복(치유율 200%, 지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "2턴 동안 침묵 상태 면역",
      "status": "ok"
    },
    {
      "text": "2턴 동안 액티브 전법 발동률 10% 증가",
      "status": "ok"
    },
    {
      "text": "무장마다 개별적으로 판정된다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.2,
          "max": 1.2,
          "target": "all_enemy"
        }
      ],
      "heal": [
        {
          "min": 2,
          "max": 2,
          "target": "self",
          "chance": 0.5
        },
        {
          "min": 2,
          "max": 2,
          "target": "random_ally_1",
          "chance": 0.5
        }
      ],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.1,
          "max": 0.1,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.5
        },
        {
          "stat": "액티브발동률",
          "min": 0.1,
          "max": 0.1,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.5
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "홍수",
          "target": "all_enemy",
          "duration": 2
        }
      ],
      "targets": [
        "all_enemy"
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"효과 1~2개 획득\"을 효과마다 50% 판정으로, \"같은 열 우선\"은 무작위 아군 1명으로 처리. 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 「전체 적군에게 120%의 책략 피해를 주고」
    c.damage(0);
    // 「2턴 동안 지속되는 홍수 상태를 부여한다」
    c.status(0);
    // 「자신과 랜덤 우군 1명(같은 열 우선)이 아래 효과 중 1~2개를 획득한다 … 무장마다 개별적으로 판정된다」
    const same = c.targets('random_same_row_ally');
    const mate = same.length ? same[0] : c.pick(c.friendsOf(c.unit));
    [c.unit, mate].filter(Boolean).forEach((u: any, i: number) => {
      const n = c.chance(0.5) ? 2 : 1;
      const pool = ['heal', 'immune', 'proc'];
      const got: string[] = [];
      for (let k = 0; k < n; k++) { const e = c.pick(pool.filter(x => !got.includes(x)))!; got.push(e); }
      c.tag('y' + i, [u]);
      // 효과: 「자신의 병력 회복(치유율 200%, 지력의 영향 받음)」
      if (got.includes('heal')) c.heal({ ...c.skill.effects.heal[0], target: 'tag:y' + i, chance: undefined });
      // 효과: 「2턴 동안 침묵 상태 면역」
      if (got.includes('immune')) c.status({ name: '침묵 면역', target: 'tag:y' + i, duration: 2 });
      // 효과: 「2턴 동안 액티브 전법 발동률 10% 증가」
      if (got.includes('proc')) c.buff({ ...c.skill.effects.buffs[0], target: 'tag:y' + i, duration: 2, chance: undefined });
    });
  },
});
