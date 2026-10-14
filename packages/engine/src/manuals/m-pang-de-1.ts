// 방덕 금병법〈초기〉 · ok
// 원문: 고유 전법 필사의 돌격이 2턴과 4턴에 발동한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-pang-de-1",
  generalId: "pang-de",
  name: "초기",
  status: "ok",
  clauses: [
    {
      "text": "고유 전법 필사의 돌격이 2턴과 4턴에 발동한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "uniquePatch": {
      "onlyTurns": [
        2,
        4
      ]
    }
  },
});
