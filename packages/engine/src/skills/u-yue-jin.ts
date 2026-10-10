// 선봉 정신 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 자신과 랜덤 우군 1명(같은 열 우선)이 선등을 획득한다. 선등: 선공이 30포인트 증가하며, 주는 피해가 14% 증가하고(선공의 영향 받음), 받는 피해가 14% 감소한다(선공의 영향 받음). 전투 첫 2턴 동안 자신이 전열이면 선등 효과가 30% 증가한다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yue-jin",
  name: "선봉 정신",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "원문 전체 구현 (2026-10-04 함수 보정)",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "'같은 열 우선' 우군 1명, 선등 주는/받는 피해에 선공 영향, '첫 2턴 동안 자신이 전열이면 선등 효과 30% 증가' 구현"
    }
  ],
  clauses: [
    {
      "text": "전투 시작시, 자신과 랜덤 우군 1명(같은 열 우선)이 선등을 획등한다",
      "status": "ok"
    },
    {
      "text": "선등: 선공 30포인트 증가",
      "status": "ok"
    },
    {
      "text": "주는 피해 14% 증가(선공의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "받는 피해가 14% 감소한다(선공의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "전투 첫 2턴동안 자신이 전열이면 선등 효과가 30% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "statMods": [
        {
          "stat": "선공",
          "min": 30,
          "max": 30,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "선공",
          "min": 30,
          "max": 30,
          "target": "tag:s",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "선공",
          "min": 9,
          "max": 9,
          "target": "self",
          "duration": 2,
          "maxStacks": 2,
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        },
        {
          "stat": "선공",
          "min": 9,
          "max": 9,
          "target": "tag:s",
          "duration": 2,
          "maxStacks": 2,
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.14,
          "max": 0.14,
          "target": "self",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는피해",
          "min": -0.14,
          "max": -0.14,
          "target": "self",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          }
        },
        {
          "stat": "주는피해",
          "min": 0.14,
          "max": 0.14,
          "target": "tag:s",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는피해",
          "min": -0.14,
          "max": -0.14,
          "target": "tag:s",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          }
        },
        {
          "stat": "주는피해",
          "min": 0.042,
          "max": 0.042,
          "target": "self",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          },
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        },
        {
          "stat": "받는피해",
          "min": -0.042,
          "max": -0.042,
          "target": "self",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          },
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        },
        {
          "stat": "주는피해",
          "min": 0.042,
          "max": 0.042,
          "target": "tag:s",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          },
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        },
        {
          "stat": "받는피해",
          "min": -0.042,
          "max": -0.042,
          "target": "tag:s",
          "duration": 2,
          "maxStacks": 2,
          "inf": {
            "stats": [
              "선공"
            ],
            "who": "self"
          },
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        }
      ]
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "원문 전체 구현 (2026-10-04 함수 보정)",
    "replacedLegacy": false
  },
  run(c) {
    // 「전투 시작시, 자신과 랜덤 우군 1명(같은 열 우선)이 선등을 획등한다」
    const same = c.targets('random_same_row_ally');
    c.tag('s', same.length ? same : c.targets('random_ally_1'));
    // 「선등: 선공 30포인트 증가」
    c.statMod(0); c.statMod(1);
    // 「주는 피해 14% 증가(선공의 영향 받음)」
    // 「받는 피해가 14% 감소한다(선공의 영향 받음)」
    c.buff(0); c.buff(1); c.buff(2); c.buff(3);
    // 「전투 첫 2턴동안 자신이 전열이면 선등 효과가 30% 증가한다」
    c.statMod(2); c.statMod(3); c.buff(4); c.buff(5); c.buff(6); c.buff(7);   // 선등 수치의 30%를 2턴 동안 더함
  },
});
