// 소교 금병법〈관문〉 · ok
// 원문: 전투 중, 부대 내의 여성 무장이 매 턴 처음으로 회복 효과를 발동하면 랜덤 적군 단일 목표에게 100%의 책략 피해를 준다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xiao-qiao-1",
  generalId: "xiao-qiao",
  name: "관문",
  status: "ok",
  note: "여성 아군(소교 포함)이 매 턴 처음 회복 효과를 낼 때 랜덤 적군 1명에게 100% 책략 피해(소교가 줌)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "회복 이벤트(FEAT-025)로 구현: 여성 아군이 그 턴 처음 회복시키면 랜덤 적 1명 100% 책략"
    }
  ],
  clauses: [
    {
      "text": "전투 중, 부대 내의 여성 무장이 매 턴 처음으로 회복 효과를 발동하면 랜덤 적군 단일 목표에게 100%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "heal",
          "role": "ally_side",
          "chance": 1
        },
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1,
              "max": 1,
              "target": "random_enemy_1"
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 heal
    (c) => {
      // 「전투 중, 부대 내의 여성 무장이 매 턴 처음으로 회복 효과를 발동하면」 — 회복시킨 무장별 그 턴 첫 회복만
      const h = c.eventCtx?.healer;
      if (!h || h.gender !== 'F') return;
      const seen = (c.unit._m_gwanmun = c.unit._m_gwanmun || {}), key = h.id + ':' + c.turn;
      if (seen[key]) return;
      seen[key] = true;
      // 「랜덤 적군 단일 목표에게 100%의 책략 피해를 준다」
      c.damage(0);
    },
  ],
});
