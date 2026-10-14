// 황충 금병법〈궁술〉 · ok
// 원문: 매 턴 종료 시, 자신이 턴 종료 전까지 시전한 일반 공격 횟수가 2회 미만이면, 1턴 동안 자신의 추격 전법 발동률과 피해가 25% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-huang-zhong-1",
  generalId: "huang-zhong",
  name: "궁술",
  status: "ok",
  note: "그 턴 일반 공격(연타 포함) 2회 미만이면 턴 종료 시 1턴(보유자 다음 행동) 동안 추격 전법 발동률·피해 +25%",
  revised: [
    {
      "date": "2026-10-05",
      "note": "턴 종료 시 그 턴 일반 공격 횟수(연타·축력 포함)를 세어 2회 미만이면 추격 발동률·피해 +25% 1턴"
    }
  ],
  clauses: [
    {
      "text": "매 턴 종료 시, 자신이 턴 종료 전까지 시전한 일반 공격 횟수가 2회 미만이면",
      "status": "ok"
    },
    {
      "text": "1턴 동안 자신의 추격 전법 발동률과 피해가 25% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "turnEnd",
        "effects": {
          "buffs": [
            {
              "stat": "추격발동률",
              "min": 0.25,
              "max": 0.25,
              "target": "self",
              "duration": 1,
              "maxStacks": 1
            },
            {
              "stat": "추격전법피해",
              "min": 0.25,
              "max": 0.25,
              "target": "self",
              "duration": 1,
              "maxStacks": 1
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnEnd
    (c) => {
      // 「매 턴 종료 시, 자신이 턴 종료 전까지 시전한 일반 공격 횟수가 2회 미만이면」 — 일반 공격마다 늘어나는 _basicSeq 의 이번 턴 증가분
      const u = c.unit, n = (u._basicSeq || 0) - (u._m_gungsul || 0);
      u._m_gungsul = u._basicSeq || 0;
      if (n >= 2) return;
      // 「1턴 동안 자신의 추격 전법 발동률과 피해가 25% 증가한다」
      c.buff(0); c.buff(1);
    },
  ],
});
