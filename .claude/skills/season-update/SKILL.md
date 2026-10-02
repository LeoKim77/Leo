---
name: season-update
description: 천하결전 시뮬레이터에 새 시즌·무장·전법·밸런스 변경·전보 녹화를 반영하고 게시판에 기록한 뒤 사이트를 다시 배포한다. 사용자가 구글 시트 주소, 엑셀, 인게임 캡처·녹화, 패치 내용을 주며 "업데이트해줘/반영해줘"라고 할 때 쓴다.
---

# 시즌·데이터 업데이트

입력 종류별로 처리하고, 마지막에 항상 **검증 → 게시판 → 배포**를 한다.

## 1. 입력 받기
- **구글 스프레드시트 주소** (복사·다운로드가 막힌 공유 시트도 '보기'만 되면 됨):
  1. `NODE_USE_ENV_PROXY=1 npx tsx packages/data-tools/src/import-gsheet.ts "<주소>" [탭 이름 일부…]` → `data/sources/gsheet/<시트id>/<gid>.json` (병합 칸 채움, 색칠 칸 기록). 네트워크 허용 도메인에 `docs.google.com`, `*.googleusercontent.com` 필요.
  2. 시즌 도감·티어덱 시트면 `data/seasons/<시즌>/name-map.json`(시트 이름 → id·한자·deck-lab id, 사람이 검토)을 만들거나 새 이름을 추가하고 `npx tsx packages/data-tools/src/import-season.ts <시즌>` → `data/seasons/<시즌>/{generals,skills,tier-decks}.json`. 시트 수치 "Lv1 → Lv2" 는 10레벨(Lv1×2)로 환산된다. 번들은 엑셀 원본 뒤에 시즌 층을 붙인다(같은 id 는 엑셀 우선).
  3. 공개 자료가 없는 값(능력치·병종·배치·발동률·이름)은 임시값 + `dataStatus` 로 남는다 → 검증 대기 목록의 `capture`(캡처로 확인)·`rate`(발동률) 항목. 캡처·공식 자료를 받으면 `data/seasons/<시즌>/name-map.json` 또는 MCP `data_patch` 로 채우고 `dataStatus` 를 지운다.
  - 열 구성이 엑셀 DB 와 같은 시트는 `.xlsx` 로 받아 `import-excel.ts` 를 써도 된다.
- **엑셀 DB 새 판**: `data/sources/` 에 넣고 `import-excel.ts` 실행. `git diff data/kr` 로 바뀐 무장·전법·수치를 확인한다.
- **인게임 캡처·녹화**: 화면의 원문(전법 설명, 스탯, 발동 확률)을 읽어 MCP `data_patch` 로 반영. 원문은 한국판 그대로 옮긴다.
- **전보 녹화**: MCP `verification_list` 에서 관련 항목을 찾아 대조하고 `verification_resolve` 로 확인/불일치를 기록한다. 불일치면 엔진 정의를 고친다(아래 3).
- 사용자 설명 중 게임 규칙이 있으면 `data/common/confirmed-rules.json` 에 R-번호로 추가한다.

## 2. 새 무장·전법 데이터
- 무장: 시즌(한국 서버 기준), 세력·위치·성향·병종, 50레벨 스탯, 고유 전법, 금병법.
- 전법: 유형(지휘/패시브/액티브/추격), 특성, 10레벨 발동 확률, 10레벨 원문.
- 해외 자료만 있으면 `overseas_lookup` + `term_normalize` 로 한국판 용어로 바꾸고 출처를 남긴다. 한국판 원문이 나오면 덮어쓴다.

## 3. 전투 엔진에 반영 (핵심)
1. 원문을 절로 나눠 기존 효과 형식으로 표현할 수 있는지 본다 (`data/engine/authored.json` 의 예: 트리거·parts·grants·statusFirst·selfStack).
2. 없는 메커니즘이면 `packages/engine/src/legacy/core.js` 에 일반화된 기능으로 추가하고 `ENGINE_FIXES` 에 FEAT-번호로 남긴다. 특정 전법 이름으로 분기하지 않는다.
3. 정의를 `authored.json`(새 전법), `overrides.json`(기존 수정), `manuals.json`(금병법)에 쓴다. 원문대로가 아니면 `status: approx` + `note` → 검증 대기 목록에 자동으로 들어간다.
4. 확인: `pnpm test` → MCP `audit_skill <전법>` → 필요하면 `sim_battle` 로 전보를 읽어 본다 → `pnpm audit`.
5. 감사가 찾은 문제(시점·확률·대상 수·효과·레벨 보간)는 오탐인지 엔진 문제인지 전보로 확인한 뒤 고친다.

## 4. 게시판
MCP `board_post` (분류: 신규 무장/신규 전법/밸런스 조정/티어덱/전투 규칙/데이터 수정/엔진/기타). 본문에 무엇이 바뀌었는지, 근사·미지원 항목, 감사 결과를 적는다. `files` 는 생략하면 미커밋 변경 파일이 자동으로 들어간다. 커밋 후에는 해당 글에 `commit` 을 채운다.

## 5. 배포
1. `pnpm build:standalone`
2. Artifact 도구로 `apps/web/dist-standalone/muhanmutu.artifact.html` 을 **기존 주소(`data/common/site.json` 의 artifactUrl)에 다시 게시**한다(새 주소를 만들지 않는다).
3. 사용자가 원하면 `muhanmutu.html` 도 파일로 보낸다(로컬 실행용).
4. 커밋·푸시.
