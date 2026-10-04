// 성라기포 · 고유 전법 · 지휘 100%
// 원문: 아군 전체가 받는 책략 피해가 10% 감소합니다(지력의 영향을 받으며, 자신에게 적용되는 효과는 30% 증가). 전투 시작 전에 성라기포를 부여하여 진형 효과를 70% 강화합니다(지력의 영향을 받음). 또한 진형 종류에 따라 기국 버프를 획득합니다.
// 원문 절 구현: approx / missing / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sp-zhuge-liang",
  name: "성라기포",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "성라기포(진형 효과 강화)·기국 버프는 미지원. 자신 30% 추가 감소 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "아군 전체가 받는 책략 피해가 10% 감소합니다(지력의 영향을 받으며, 자신에게 적용되는 효과는 30% 증가)",
      "status": "approx"
    },
    {
      "text": "전투 시작 전에 성라기포를 부여하여 진형 효과를 70% 강화합니다(지력의 영향을 받음)",
      "status": "missing"
    },
    {
      "text": "또한 진형 종류에 따라 기국 버프를 획득합니다",
      "status": "missing"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는책략피해",
          "min": -0.1,
          "max": -0.1,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "성라기포(진형 효과 강화)·기국 버프는 미지원. 자신 30% 추가 감소 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는책략피해 -10%, 대상 all_ally, 전투 종료까지, 최대 1중첩
  },
});
