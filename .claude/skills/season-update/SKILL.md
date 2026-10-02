---
name: season-update
description: 천하결전 시뮬레이터에 새 시즌·무장·전법·밸런스 변경·전보 녹화를 반영하고 게시판에 기록한 뒤 사이트를 다시 배포한다. 사용자가 구글 시트 주소, 엑셀, 인게임 캡처·녹화, 패치 내용을 주며 "업데이트해줘/반영해줘"라고 할 때 쓴다.
---

# 시즌·데이터 업데이트

입력 종류별로 처리하고, 마지막에 항상 **검증 → 게시판 → 배포**를 한다.

## 1. 입력 받기
- **구글 스프레드시트 주소**: Google Drive 커넥터로 읽는다(시트별 표). 열 구성이 엑셀 DB 와 같으면 `.xlsx` 로 내려받아 `npx tsx packages/data-tools/src/import-excel.ts <파일>`. 다르면 MCP `data_patch` 로 항목별 반영.
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
2. Artifact 도구로 `apps/web/dist-standalone/cheonha-lab.artifact.html` 을 **기존 주소(`data/common/site.json` 의 artifactUrl)에 다시 게시**한다(새 주소를 만들지 않는다).
3. 사용자가 원하면 `cheonha-lab.html` 도 파일로 보낸다(로컬 실행용).
4. 커밋·푸시.
