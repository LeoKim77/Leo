// 조조 금병법〈맹덕신서 하권〉 · ok
// 원문: 전체 아군이 일반 공격을 시전하기 직전마다 최고 속성이 8포인트 증가한다(지력의 영향 받음), 3회 중첩 가능하며 턴 종료까지 지속된다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cao-cao-2",
  generalId: "cao-cao",
  name: "맹덕신서 하권",
  status: "ok",
  note: "아군 전원이 일반 공격 직전마다 최고 속성 +8(조조 지력 영향, 전투 시작 시 조조 지력 기준), 3중첩, 턴 종료 시 사라짐",
  revised: [
    {
      "date": "2026-10-10",
      "note": "녹화: 최고 속성 증가가 조조의 그 순간 지력을 따름(11.90·11.53) — 부여 때 한 번 계산 → 매번 조조 현재 지력, 가중치 0.27% (FEAT-032)"
    },
    {
      "date": "2026-10-05",
      "note": "지력 영향(조조 지력, 부여 시점)·턴 종료까지 지속을 원문대로"
    }
  ],
  clauses: [
    {
      "text": "전체 아군이 일반 공격을 시전하기 직전마다 최고 속성이 8포인트 증가한다(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "3회 중첩 가능하며 턴 종료까지 지속된다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": [],
          "grants": [
            {
              "key": "맹덕신서",
              "target": "all_ally",
              "skill": {
                "_timing": "beforeBasic",
                "effects": {
                  "damage": [],
                  "heal": [],
                  "buffs": [],
                  "statMods": [
                    {
                      "stat": "최고속성",
                      "min": 8,
                      "max": 8,
                      "target": "self",
                      "duration": 1,
                      "maxStacks": 3,
                      "untilTurnEnd": true
                    }
                  ],
                  "statusEffects": [],
                  "targets": []
                }
              }
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      // 「전체 아군이 일반 공격을 시전하기 직전마다 최고 속성이 8포인트 증가한다(지력의 영향 받음)」 — 조조 지력 영향을 부여 때 곱한다
      //   녹화(2026-10-10): 받은 무장과 상관없이 조조의 그 순간 지력을 따른다 — 조조 288.80 → +11.90, 258.93 → +11.53 (FEAT-032, 가중치 0.27%)
      const g = c.skill.effects.grants[0], sm = g.skill.effects.statMods[0];
      // 「3회 중첩 가능하며 턴 종료까지 지속된다」 (untilTurnEnd)
      c.grant({ ...g, skill: { ...g.skill, effects: { ...g.skill.effects, statMods: [{ ...sm, inf: { stats: ['지력'], who: 'grantor', weight: 0.0027 } }] } } });
    },
  ],
});
