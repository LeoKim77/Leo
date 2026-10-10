// 유비 금병법〈인의론〉 · ok
// 원문: 치유폭이 12% 증가하며,(지력의 영향 받음), 우군을 4회 치유할 때마다 랜덤 우군 단일 목표가 1턴 동안 정신 회복을 획득한다. 매 턴 최대 1회 발동된다.
// 원문 절 구현: ok / ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-liu-bei-2",
  generalId: "liu-bei",
  name: "인의론",
  status: "ok",
  note: "치유폭 +12%(지력 영향). 아군을 4번 회복시킬 때마다 랜덤 아군 1명 정신 회복 1턴(턴당 1회). '우군' 범위(자신 포함 여부)는 게임 문구 확인 대기",
  revised: [
    {
      "date": "2026-10-05",
      "note": "치유폭 지력 영향 반영, 회복 이벤트(FEAT-025)로 '4회 치유마다 정신 회복(턴당 1회)' 구현"
    }
  ],
  clauses: [
    {
      "text": "치유폭이 12% 증가하며",
      "status": "ok"
    },
    {
      "text": "(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "우군을 4회 치유할 때마다 랜덤 우군 단일 목표가 1턴 동안 정신 회복을 획득한다",
      "status": "ok"
    },
    {
      "text": "매 턴 최대 1회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "buffs": [
            {
              "stat": "주는회복량",
              "min": 0.12,
              "max": 0.12,
              "target": "self",
              "duration": 999,
              "maxStacks": 1,
              "inf": {
                "stats": [
                  "지력"
                ],
                "who": "self"
              }
            }
          ]
        }
      },
      {
        "trigger": {
          "event": "heal",
          "role": "self",
          "chance": 1
        },
        "effects": {
          "statusEffects": [
            {
              "name": "정신 회복",
              "target": "random_ally_one",
              "duration": 1
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      // 「치유폭이 12% 증가하며,(지력의 영향 받음)」
      c.buff(0);
    },
    // parts[1] — 계기 heal
    (c) => {
      // 「우군을 4회 치유할 때마다 랜덤 우군 단일 목표가 1턴 동안 정신 회복을 획득한다」 — 우리 편 회복 횟수를 센다
      const u = c.unit, t = c.eventCtx?.target;
      if (!t || t.side !== u.side) return;
      u._m_renyi = (u._m_renyi || 0) + 1;
      if (u._m_renyi % 4 !== 0) return;
      // 「매 턴 최대 1회 발동된다」
      if (u._m_renyiTurn === c.turn) return;
      u._m_renyiTurn = c.turn;
      c.status(0);
    },
  ],
});
