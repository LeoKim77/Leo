// 육손 금병법〈분영〉 · ok
// 원문: 자신의 심리 공격이 5% 증가한다. 연소 시전 시 1턴간 목표의 최고 속성이 5%(지력의 영향을 받음) 추가로 감소한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lu-xun-2",
  generalId: "lu-xun",
  name: "분영",
  status: "ok",
  note: "심리 공격 +5%. 육손이 연소를 부여할 때마다 그 목표 최고 속성 −5%(지력 영향) 1턴",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 연소 미지원 절만 근사"
    },
    {
      "date": "2026-10-05",
      "note": "연소 구현(R-048)으로 '연소 시전 시 1턴간 목표의 최고 속성 5%(지력 영향) 추가 감소' 구현"
    }
  ],
  clauses: [
    {
      "text": "자신의 심리 공격이 5% 증가한다",
      "status": "ok"
    },
    {
      "text": "연소 시전 시 1턴간 목표의 최고 속성이 5%(지력의 영향을 받음) 추가로 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "debuff",
          "role": "self_cast",
          "statusName": "연소",
          "chance": 1
        },
        "effects": {
          "statMods": []
        }
      }
    ],
    "static": {
      "mods": {
        "심리공격": 0.05
      }
    }
  },
  runs: [
    // parts[0] — 계기 debuff
    (c) => {
      // 「연소 시전 시 1턴간 목표의 최고 속성이 5%(지력의 영향을 받음) 추가로 감소한다」 — 그 순간 목표의 가장 높은 능력치 기준
      const t = c.eventCtx?.target;
      if (!t) return;
      const key = ['무력', '지력', '통솔', '선공'].reduce((m, k) => (c.stat(t, k) > c.stat(t, m) ? k : m), '무력');
      const v = c.stat(t, key) * 0.05 * c.infl('지력');
      c.statMod({ stat: key, min: -v, max: -v, target: 'trigger_target', duration: 1, maxStacks: 1 });
    },
  ],
});
