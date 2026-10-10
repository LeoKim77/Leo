// 소신발언 · 고유 전법 · 액티브 60%
// 원문(시즌3 미리보기 2026-10-07): 랜덤 아군 2명의 디버프 상태 2가지를 제거하며, 해당 아군의 병력을 회복시킨다(치유율: 180%, 지력의 영향 받음). 2턴 동안 전체 적군이 주는 피해가 24% 감소한다(지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-zhao",
  name: "소신발언",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "대상 공유·지력 영향",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 소신발언, 해외 번역 문구를 한국판 원문으로 교체"
    },
    {
      "date": "2026-10-05",
      "note": "디버프 해제와 회복이 같은 랜덤 아군 2명에게, 지력 영향"
    }
  ],
  clauses: [
    {
      "text": "랜덤 아군 2명의 디버프 상태 2가지를 제거하며",
      "status": "ok"
    },
    {
      "text": "해당 아군의 병력을 회복시킨다(치유율: 180%, 지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "2턴 동안 전체 적군이 주는 피해가 24% 감소한다(지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "heal": [
        {
          "min": 1.8,
          "max": 1.8,
          "target": "tag:two"
        }
      ],
      "dispel": [
        {
          "target": "tag:two",
          "count": 2
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "all_enemy",
          "duration": 2,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ]
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "대상 공유·지력 영향 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    c.tag('two', c.targets('random_ally_n'));
    // 「아군 무작위 2명의 디버프 상태 2종을 해제하고」
    c.dispel(0);
    // 「병력을 회복합니다」
    c.heal(0);
    // 「치료율: 180%(지력의 영향을 받음)」
    // 「또한 적군 전체가 가하는 피해를 24% 감소시킵니다(지력의 영향을 받음)」
    c.buff(0);
  },
});
