// 감녕 금병법〈산림탈기〉 · ok
// 원문: 자신이 받는 병기 피해가 5% 감소하며, 회유가 5% 증가한다. 일반 공격 전, 60% 확률로 랜덤 적군 단일 목표에게 30%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-gan-ning-1",
  generalId: "gan-ning",
  name: "산림탈기",
  status: "ok",
  note: "게임 원문(2026-10-03 미리보기): 일반 공격 전 60% 확률로 랜덤 적군 1명에게 30% 책략 피해. 엑셀 원문(\"주는 책략 피해 30% 증가\")은 오기",
  clauses: [
    {
      "text": "자신이 받는 병기 피해가 5% 감소하며",
      "status": "ok"
    },
    {
      "text": "회유가 5% 증가한다",
      "status": "ok"
    },
    {
      "text": "일반 공격 전, 60% 확률로 랜덤 적군 단일 목표에게 30%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 0.3,
              "max": 0.3,
              "target": "random_enemy_1"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "beforeBasic",
        "chance": 0.6
      }
    ],
    "static": {
      "mods": {
        "받는병기피해": -0.05,
        "회유": 0.05
      }
    }
  },
  runs: [
    // parts[0] — 시점 beforeBasic
    (c) => {
      c.damage(0);   // 책략 30%, 대상 random_enemy_1
    },
  ],
});
