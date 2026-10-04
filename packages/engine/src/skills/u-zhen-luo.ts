// 바람과 눈꽃 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음), 우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음), 주는 피해가 12.25% 증가한다. 낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다.
// 원문 절 구현: ok / ok / ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhen-luo",
  name: "바람과 눈꽃",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "매 턴 시작 시, 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    },
    {
      "text": "우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    },
    {
      "text": "주는 피해가 12.25% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "uskill_25",
    "legacyName": "바람과 눈꽃",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 시작 시, 자신의 병력을 회복하며(치유율 70%→140%, 지력의 영향 받음), 우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 70%→140%, 지력의 영향 받음), 주는 피해가 12.5%→25% 증가한다. 낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다.",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.7,
          "max": 1.4
        },
        {
          "min": 0.7,
          "max": 1.4
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.125,
          "max": 0.25,
          "duration": 1,
          "maxStacks": 1
        },
        {
          "stat": "확정회심",
          "min": 1,
          "max": 1,
          "target": "random_ally_n",
          "nonBasicOnly": true
        }
      ],
      "statMods": [],
      "targets": [
        "random_ally_n",
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "매 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신의 병력을 회복",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "(치유율 70%→140%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "(치유율 70%→140%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "주는 피해가 12.5%→25% 증가한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "낙수의 여신 획득 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「매 턴 시작 시, 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 70%→140%
    c.heal(1);   // 치유율 70%→140%
    // 「주는 피해가 12.25% 증가한다」
    c.buff(0);   // 주는피해 +12.5%→25%, 1턴, 최대 1중첩
    c.buff(1);   // 확정회심 +100%, 대상 random_ally_n
  },
});
