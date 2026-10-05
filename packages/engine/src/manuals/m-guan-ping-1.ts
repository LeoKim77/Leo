// 관평 금병법〈용음〉 · ok
// 원문: 전투 1번째 턴에 전체 적군에게 2턴 지속되는 공포 상태를 부여한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-guan-ping-1",
  generalId: "guan-ping",
  name: "용음",
  status: "ok",
  clauses: [
    {
      "text": "전투 1번째 턴에 전체 적군에게 2턴 지속되는 공포 상태를 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [
            {
              "name": "공포",
              "target": "all_enemy",
              "duration": 2
            }
          ],
          "targets": []
        },
        "_timing": "turnStart",
        "onlyTurns": [
          1
        ]
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.status(0);   // 공포, 대상 all_enemy, 2턴
    },
  ],
});
