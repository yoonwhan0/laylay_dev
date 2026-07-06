# Laytime 개발 인계 메모

LayLay Laytime 1차 인계용 정리입니다.  
Figma 시안 기준으로 화면 맞춰 두었고, 지금은 **Vanilla JS + 정적 HTML** 로 돌아가게 만들어 둔 상태예요.  
귀사 쪽에서는 PHP로 옮기시면 됩니다.

---

## 뭐가 들어있나

**Lay-Z Check**  
8문항 퀴즈 → 0~99점 게으름 지수 → AI가 결과 문구·추천·수면 가이드 써줌

**Lay Mong**  
꿈 내용 + 생년월일·성별·시간·기분 입력 → AI가 해몽·운세 → 도감에도 쌓임

소스는 전부 `site/` 아래 있습니다.

---

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

`.env`에 `OPENAI_API_KEY` 넣어야 AI 응답 나옵니다.  
API 경로는 `POST /api/openai-dev` — 지금은 `netlify/functions/openai-dev-chat.js`가 받아서 OpenAI로 넘깁니다. PHP 이식할 때 이 부분만 서버 API로 바꿔주시면 돼요. **키는 서버에만** 두시면 됩니다.

---

## 화면 이동 (hash)

| 주소 | 화면 |
|------|------|
| `#/` | Laytime 메인 (Lay-Z / Lay Mong 선택) |
| `#/layz` | Lay-Z 시작 |
| `#/quiz` | 8문항 |
| `#/loading` | Lay-Z 분석 중 |
| `#/result` | Lay-Z 결과 |
| `#/history` | Lay-Z 7일 기록 |
| `#/laymong` | Lay Mong 입력 |
| `#/laymong/encyclopedia` | 레이몽 도감 |
| `#/laymong/loading` | Lay Mong 분석 중 |
| `#/laymong/result` | Lay Mong 결과 |
| `#/laymong/history` | Lay Mong 기록 |

`app.js`에서 라우팅·화면 그리기 다 합니다.

---

## AI 프롬프트 — 여기가 제일 중요합니다

프롬프트 문구 전체는 아래 두 파일에 있습니다. **이식할 때 이 파일들 기준으로** 가져가 주세요.

### Lay-Z → `site/assets/js/layz-ai.js`

- **언제 호출:** 8문항 끝나고 로딩 지나갈 때 (`app.js` → `runLayZAiFlow()`)
- **뭐 하는 파일:** `layz-ai.js`
- **주요 함수**
  - `buildAnswerProfile()` — 사용자가 고른 답을 프롬프트용 텍스트로 묶음
  - `fetchCopy()` — `layzSystem`(시스템 프롬프트) + user 메시지 만들어서 API 호출
  - `mapToUi()` — AI가 준 JSON을 화면에 맞게 변환. 실패하면 `data.js` 고정 문구로 대체
- **API:** `POST /api/openai-dev`, 모델 기본 `gpt-4o-mini`, `max_tokens: 4800`, `temperature: 0.78`
- **AI가 뱉어야 하는 JSON 키:** `tierName`, `tierTag`, `head`, `desc`, `summary`, `recs`(3개), `rx.items`(3개)
- **점수는 AI가 안 바꿉니다.** 8문항 합산 점수는 `data.js` / `app.js`에서 이미 계산된 값을 그대로 넘깁니다.

### Lay Mong → `site/assets/js/laymong-ai.js`

- **언제 호출:** 꿈 입력 폼 제출 후 로딩 (`app.js` → `runMongAiFlow()`)
- **뭐 하는 파일:** `laymong-ai.js`
- **주요 함수**
  - `buildBirthProfile()` — 생년월일·성별·시간 정리. **시간 모름이면 12지 언급 금지** 규칙 있음
  - `fetchDream()` — `laymongSystem` + 꿈 내용 프롬프트 조립 후 API 호출
  - `parsedToFortune()` — JSON → 화면용 구조로 변환
  - 파일 맨 위 `MOCK` — API 실패·파싱 실패 시 쓰는 폴백 문장
- **API:** 같은 `/api/openai-dev`, `max_tokens: 4800`, `temperature: 0.72`
- **AI가 뱉어야 하는 JSON 키:** `재물운`~`건강운`(1~5), `재물운설명` 등 설명 4개, `총론설명`, `한줄평`, `행운의색`, `행운의숫자`, `행운의물건`, `행동해시태그`
- **점수:** 네 운 합 × 5

프롬프트 원문은 파일 열어보시면 `layzSystem`, `laymongSystem` 변수랑 그 아래 user 메시지 조립 부분에 다 들어 있습니다.

---

## 나머지 JS 역할

| 파일 | 하는 일 |
|------|---------|
| `app.js` | 화면, 버튼, AI 호출 타이밍, 공유 모달 |
| `data.js` | 8문항 `QUESTIONS`, 모드 구간, Lay-Z AI 실패 시 `RESULT_COPY` |
| `laymong-feed.js` | 도감 목록·검색 (localStorage) |

### localStorage 키

- `layz_history` — Lay-Z 기록
- `laymong_history` — Lay Mong 기록
- `laymong_feed` — 도감 (키 이름 `laymong_feed_v2`로 feed 쪽에서 씀)

---

## 디자인

Figma가 기준입니다. 시안에 없는 UI(뱃지 블록, 해시태그 섹션 같은 거)는 넣지 않았어요. 이식할 때도 시안 밖으로 안 나가게 부탁드립니다.

Figma 파일: `KReLGgYJ1fL8fByRIw5pnG`  
- 허브: `3744:43471`  
- Lay-Z: `3744:43470`  
- Lay Mong: `3833:1623`

---

## 아직 안 된 것 (알고 계시면 됩니다)

- 상단 Shop, Brand 등 링크 → `#` 비어 있음 (몰 연동은 나중에)
- 기록 삭제 → 지금은 `confirm()` (Figma엔 모달 있음)
- 카카오 공유 → 버튼만 있고 SDK 연동 전
- 헤더·푸터 → LayLay 메인 몰 거 붙이셔야 함

---

## PHP 옮기실 때 체크

- [ ] `site/` 화면·플로우 Figma랑 맞는지
- [ ] `/api/openai-dev` → PHP API로 교체, OpenAI 키 서버만
- [ ] `layz-ai.js`, `laymong-ai.js` 프롬프트·JSON 스키마 유지
- [ ] 메인 몰 헤더/푸터/GNB 연동
- [ ] 기록 저장 localStorage → 회원 연동 여부는 나중에 논의

궁금한 거 있으면 편하게 연락 주세요.
