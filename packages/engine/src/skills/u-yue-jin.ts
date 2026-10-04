// 선봉정신 · 고유 전법 · 지휘 100%
// 원문: 전투 시작시, 자신과 랜덤 우군 1명(같은 열 우선)이 선등을 획등한다. 선등: 선공 30포인트 증가, 주는 피해 14% 증가(선공의 영향 받음), 받는 피해가 14% 감소한다(선공의 영향 받음). 전투 첫 2턴동안 자신이 전열이면 선등 효과가 30% 증가한다.
// 원문 절 구현: ok / ok / ok / ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yue-jin",
  name: "선봉정신",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "선공 영향·\"첫 2턴 전열이면 30% 증가\" 미반영",
    "source": "authored"
  },
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
      "status": "missing"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.14,
          "max": 0.14,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "받는피해",
          "min": -0.14,
          "max": -0.14,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "주는피해",
          "min": 0.14,
          "max": 0.14,
          "target": "tag:s",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "받는피해",
          "min": -0.14,
          "max": -0.14,
          "target": "tag:s",
          "duration": 999,
          "maxStacks": 1
        }
      ],
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
          "target": "random_ally_1",
          "duration": 999,
          "maxStacks": 1,
          "tag": "s"
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "선공 영향·\"첫 2턴 전열이면 30% 증가\" 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 선공 30, 대상 self, 전투 종료까지, 최대 1중첩
    c.statMod(1);   // 선공 30, 대상 random_ally_1, 전투 종료까지, 최대 1중첩
    c.buff(0);   // 주는피해 +14%, 대상 self, 전투 종료까지, 최대 1중첩
    c.buff(1);   // 받는피해 -14%, 대상 self, 전투 종료까지, 최대 1중첩
    c.buff(2);   // 주는피해 +14%, 대상 tag:s, 전투 종료까지, 최대 1중첩
    c.buff(3);   // 받는피해 -14%, 대상 tag:s, 전투 종료까지, 최대 1중첩
  },
});
