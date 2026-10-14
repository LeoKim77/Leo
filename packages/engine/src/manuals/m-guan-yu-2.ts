// 관우 금병법〈오상〉 · ok
// 원문: 병력이 자신보다 높은 목표에게 주는 피해가 10% 증가한다. 고유 전법 화하 진압이 병력이 자신보다 높은 목표에게 생성하는 탈주병 수가 30% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-guan-yu-2",
  generalId: "guan-yu",
  name: "오상",
  status: "ok",
  note: "탈주병 증가는 모든 탈주병에 적용(고유 전법 화하 진압만 탈주병을 만듦)",
  clauses: [
    {
      "text": "병력이 자신보다 높은 목표에게 주는 피해가 10% 증가한다",
      "status": "ok"
    },
    {
      "text": "고유 전법 화하 진압이 병력이 자신보다 높은 목표에게 생성하는 탈주병 수가 30% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "병력우위대상피해": 0.1,
        "탈주병증가_병력우위": 0.3
      }
    }
  },
});
