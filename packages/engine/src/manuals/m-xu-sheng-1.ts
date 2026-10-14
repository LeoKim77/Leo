// 서성 금병법〈의성〉 · ok
// 원문: 전투 1번째 턴에 랜덤 적군 2명에게 2턴 동안 지속되는 홍수 상태 부여. 전체 아군이 피해를 받을 때, 피해를 준 상대가 홍수 상태면 해당 피해가 8% 감소한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xu-sheng-1",
  generalId: "xu-sheng",
  name: "의성",
  status: "ok",
  note: "홍수 상태 적이 아군에게 주는 피해 −8%, 서성 생존 중(FEAT-015)",
  clauses: [
    {
      "text": "전투 1번째 턴에 랜덤 적군 2명에게 2턴 동안 지속되는 홍수 상태 부여",
      "status": "ok"
    },
    {
      "text": "전체 아군이 피해를 받을 때, 피해를 준 상대가 홍수 상태면 해당 피해가 8% 감소한다",
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
              "name": "홍수",
              "target": "random_enemy_n",
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
    ],
    "unit": {
      "floodWard": 0.08
    }
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.status(0);   // 홍수, 대상 random_enemy_n, 2턴
    },
  ],
});
