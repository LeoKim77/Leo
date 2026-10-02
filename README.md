# 천하결전 덱 연구소

삼국지 천하결전 덱 전투 시뮬레이터 — 한국판 데이터 기준, 실제 게임과 가장 비슷한 전투 재현이 목표.

- 설계·구현 현황: [docs/DESIGN.md](docs/DESIGN.md)
- 기존 버전(v1.12b, 단일 HTML): [legacy/simulator-v1.12b.html](legacy/simulator-v1.12b.html)

## 자주 쓰는 명령

```bash
pnpm install
pnpm import:all          # 엑셀·v1.12b·deck-lab 다시 가져오기 + 웹 번들 생성
pnpm build:bundle        # data/ 변경만 웹 번들에 반영
pnpm audit               # 규칙 감사 (전체 약 20초) → data/audit/latest.json
pnpm test                # 엔진 동등성·감사·데이터 무결성 테스트
pnpm dev                 # 웹 개발 서버 (apps/web)
pnpm build               # 웹 배포 빌드 → apps/web/dist
```

새 엑셀을 받으면: `npx tsx packages/data-tools/src/import-excel.ts <엑셀 경로>` → `pnpm build:bundle` → `pnpm audit`.

## Claude 와 MCP 로 쓰기

저장소를 Claude Code 로 열면 `.mcp.json` 의 `cheonha-sim` 서버가 연결됩니다.
게임에서 확인한 정보를 말로 알려주면 Claude 가 다음 순서로 처리합니다.

1. `data_patch` — 스탯·원문·발동률·신규 무장/전법을 엑셀 원본 위에 반영 (한국판 용어로 자동 정규화)
2. `board_post` — 업데이트 게시판에 날짜·시즌·분류와 함께 기록
3. `bundle_rebuild` → `audit_skill` — 웹 반영 후 그 전법이 원문대로 발동하는지 감사
4. 커밋·푸시

그 밖의 도구: `game_search`, `game_get`, `tierdeck_list`, `term_normalize`, `overseas_lookup`,
`sim_battle`, `sim_matchup`, `audit_run`, `audit_summary`, `board_list`.

## 출처

- 한국판 DB: 천하결전 DB 엑셀 (S2, 2025-09-25) — 원 출처 (배포용) S1 삼국지: 천하결전 | 힛파비전
- 해외 참고: 천덱랩 deck-lab v5.0 공유 HTML (각 항목의 원출처 URL 포함), 연무 전보 통계 CC BY 4.0 (CharlesWang505)
