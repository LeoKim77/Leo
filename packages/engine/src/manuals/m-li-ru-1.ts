// 이유 금병법〈비호〉 · ok
// 원문: 전투 시작 시, 자신이 2스택의 방어를 획득하며, 우군 2명의 회유와 심리 공격이 6% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-li-ru-1",
  generalId: "li-ru",
  name: "비호",
  status: "ok",
  note: "방어 2스택(FIX-004)",
  clauses: [
    {
      "text": "전투 시작 시, 자신이 2스택의 방어를 획득하며",
      "status": "ok"
    },
    {
      "text": "우군 2명의 회유와 심리 공격이 6% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "회유",
              "min": 0.06,
              "max": 0.06,
              "target": "random_ally_n",
              "duration": 999,
              "maxStacks": 1
            },
            {
              "stat": "심리공격",
              "min": 0.06,
              "max": 0.06,
              "target": "random_ally_n",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [
            {
              "name": "방어",
              "target": "self",
              "duration": 99
            },
            {
              "name": "방어",
              "target": "self",
              "duration": 99
            }
          ],
          "targets": []
        },
        "_timing": "battleStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.buff(0);   // 회유 +6%, 대상 random_ally_n, 전투 종료까지, 최대 1중첩
      c.buff(1);   // 심리공격 +6%, 대상 random_ally_n, 전투 종료까지, 최대 1중첩
      c.status(0);   // 방어, 대상 self, 99턴
      c.status(1);   // 방어, 대상 self, 99턴
    },
  ],
});
