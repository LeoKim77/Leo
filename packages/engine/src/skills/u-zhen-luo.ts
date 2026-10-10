// 바람과 눈꽃 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음), 우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음), 주는 피해가 12.25% 증가한다. 낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhen-luo",
  name: "바람과 눈꽃",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "자신 회복 + '우군 1명(후열 우선)'이 낙수의 여신 1턴: 그 우군 회복 140%·주는 피해 +12.25%·다음 비평타 피해 회심·묘책 확정 — 예전엔 회복·버프가 엉뚱한 대상에"
    },
    {
      "date": "2026-10-05",
      "note": "낙수의 여신 대상 선택에 금병법 낙신부(지력/무력 최고 우군 우선) 연결 — def.goddessPick"
    }
  ],
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
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_25",
    "legacyName": "바람과 눈꽃",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 시작 시, 자신의 병력을 회복하며(치유율 70%→140%, 지력의 영향 받음), 우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 70%→140%, 지력의 영향 받음), 주는 피해가 12.5%→25% 증가한다. 낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다.",
    "effects": {
      "heal": [
        {
          "min": 0.7,
          "max": 1.4,
          "target": "self"
        },
        {
          "min": 0.7,
          "max": 1.4,
          "target": "tag:g"
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.1225,
          "max": 0.1225,
          "target": "tag:g",
          "duration": 1,
          "maxStacks": 1
        },
        {
          "stat": "확정회심",
          "min": 1,
          "max": 1,
          "target": "tag:g",
          "nonBasicOnly": true,
          "cap": 1
        }
      ],
      "targets": [
        "self"
      ]
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
    c.heal(0);
    // 「우군 1명(후열 우선 선택)이 낙수의 여신을 1턴 동안 획득한다: 자신의 병력을 회복하며(치유율 140%, 지력의 영향 받음)」
    //   금병법 낙신부 상권/하권이면 지력/무력이 가장 높은 우군을 우선 선택 (uniquePatch 의 goddessPick)
    const fr = c.friendsOf(c.unit), back = fr.filter(u => u.position === 'back');
    const pri = c.skill.goddessPick;
    c.tag('g', [pri ? fr.reduce((m, u) => (c.stat(u, pri) > c.stat(m, pri) ? u : m), fr[0]) : c.pick(back.length ? back : fr)]);
    // 「주는 피해가 12.25% 증가한다」
    c.heal(1); c.buff(0);
    // 「낙수의 여신 획득 후, 처음으로 일반 공격이 아닌 피해 시전 시 회심 및 묘책이(가) 반드시 발동된다」
    c.buff(1);
  },
});
