// 신속 출병 · 고유 전법 · 지휘 100%
// 원문(시즌3 미리보기 2026-10-07): 자신이 받는 피해가 12% 감소한다(통솔의 영향 받음). 매 턴 처음 피해를 받은 후, 군령을 1개 획득한다. 군령: 전체 아군의 통솔이 25포인트 증가하며 중첩될 수 있고, 최대 10개 보유할 수 있다. 자신의 통솔이 60포인트 증가할 때마다 추가로 군령을 1개 획득한다. 최초로 10스택의 군령을 보유하면 전체 적군에게 260%의 병기 피해를 준다(추가로 통솔 차이의 영향 받음).
// 원문 절 구현: approx / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huangfu-song",
  name: "신속 출병",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 신속 출병, 해외 번역 문구를 한국판 원문으로 교체"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "군령 추가 획득·10중첩 260% 구현(FEAT-030). 260%의 \"통솔 차이 영향\"은 공식 미상이라 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신이 받는 피해가 12% 감소한다(통솔의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "매 턴 처음 피해를 받은 후, 군령을 1개 획득한다",
      "status": "ok"
    },
    {
      "text": "군령: 전체 아군의 통솔이 25포인트 증가하며 중첩될 수 있고",
      "status": "ok"
    },
    {
      "text": "최대 10개 보유할 수 있다",
      "status": "ok"
    },
    {
      "text": "자신의 통솔이 60포인트 증가할 때마다 추가로 군령을 1개 획득한다",
      "status": "ok"
    },
    {
      "text": "최초로 10스택의 군령을 보유하면 전체 적군에게 260%의 병기 피해를 준다(추가로 통솔 차이의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.12,
          "max": -0.12,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "maxPerTurn": 1
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "통솔",
              "min": 25,
              "max": 25,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 10
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "군령 추가 획득·10중첩 260% 구현(FEAT-030). 260%의 \"통솔 차이 영향\"은 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신이 받는 피해가 12% 감소한다(통솔의 영향 받음)」
    c.buff(0);
    // 군령 계산의 기준 통솔(전투 시작 시점)
    (c.unit as any)._junling = { n: 0, base: c.stat(c.unit, '통솔'), credited: 0, fired: false };
  },
  partRuns: [
    (c) => {
      // 「매 턴 처음 피해를 받은 후, 군령을 1개 획득한다」(trigger maxPerTurn 1)
      const u: any = c.unit;
      const J = u._junling || (u._junling = { n: 0, base: c.stat(u, '통솔'), credited: 0, fired: false });
      const gain = () => {
        if (J.n >= 10) return;
        J.n++;
        // 「군령: 전체 아군의 통솔이 25포인트 증가하며 중첩될 수 있고, 최대 10개 보유할 수 있다」
        c.statMod(0);
      };
      gain();
      // 「자신의 통솔이 60포인트 증가할 때마다 추가로 군령을 1개 획득한다」 — 전투 시작 대비 증가분
      for (let guard = 0; guard < 10; guard++) {
        const due = Math.floor(Math.max(0, c.stat(u, '통솔') - J.base) / 60);
        if (due <= J.credited || J.n >= 10) break;
        J.credited++;
        gain();
      }
      // 「최초로 10스택의 군령을 보유하면 전체 적군에게 260%의 병기 피해를 준다(추가로 통솔 차이의 영향 받음)」
      if (J.n >= 10 && !J.fired) {
        J.fired = true;
        c.damage({ dmgType: '병기', min: 2.6, max: 2.6, target: 'all_enemy' });
      }
    },
  ],
});
