# Lay Lay 시뮬 — AI 연동 테스트 안내 (메일용 초안)

---

**제목 예시:** Lay Lay 시뮬 HTML — OpenAI(GPT) 테스트 방법 및 AI가 붙는 영역 정리

---

안녕하세요,

현재 `site/index.html`은 **좌측 고정 패널**(설정) + **우측 시뮬 화면**으로 구성됩니다.  
상단 안내는 자동으로 다음처럼 보여줍니다.  
- **테스트 환경으로 보이면:** “API 키 수동 입력 후 테스트”  
- **실배포 환경으로 보이면:** “서버 환경변수(`OPENAI_API_KEY`)가 있으면 키 입력 없이 모델만 선택”  
성공 여부는 토스트로 확인합니다(**`… · GPT 결과` / `Mock(…)`**).  
  
실제 테스트는 각 시뮬의 기존 버튼으로 진행합니다.  
- **Lay-몽:** 「해몽 시작하기」 후 토스트 예: 실제 GPT 반영 성공 **`NNNms · GPT 결과`** / API·JSON 문제 **`NNNms · Mock(API오류 등)`**.  
- **Lay-Z:** 「AI 코멘트 생성」 성공 **`NNNms · GPT`** / 실패 **`Mock(…)`** · 코멘트는 카드 안에 채움.

---

## 1. 좌측 임시 패널에서 하는 일

1. **테스트 로컬:** OpenAI API 키 입력 후 저장.
2. **실배포:** 서버 `OPENAI_API_KEY`가 이미 세팅되어 있으면 키 입력 없이 모델만 선택.
3. 부모 패널 값은 `postMessage`로 iframe에 동기화.
4. 응답 구분은 **토스트 접미사** (`GPT 결과` / `Mock(…)`).
5. API 프록시는 Netlify 함수 `/.netlify/functions/openai-dev-chat` (별칭 `/api/openai-dev`). **`file://` 는 불가**하며 `netlify dev` 또는 배포 URL 사용을 권장합니다.

---

## 2. 프롬프트 현황 (Lay-몽 vs Lay-Z)

### Lay-몽 — **메인 GPT 프롬프트가 이미 있음**

`site/sim/lay-mong.html` 의 **`async function startDream()`** 안에, 꿈 해몽 전문가 역할 설정 + 사용자 생년·꿈·기분 변수를 끼워 넣은 **긴 사용자 프롬프트 문자열(`prompt`)** 이 이미 존재합니다.  
반환 형식은 **고정 JSON 스키마**를 강하게 요구하는 문구까지 포함되어 있어, UI(`renderResult`)와 1:1로 맞춰 두었습니다.  
별도 「시스템 메시지」 분리 없이 **`messages: [{ role: 'user', content: prompt }]`** 한 번에 보내는 구조입니다.

### Lay-Z력 — **통합 레이블 프롬프트는 원래 없음 → 지금은 임의(프로토타입) 두었음**

- **Lay-Z 테스트 자체(질문·선택지·점수·티어)** 는 전부 HTML/자바스크립트 규칙으로만 계산됩니다. Lay-몽처럼 “전체 결과를 GPT가 채워 주는” 흐름은 **아니다**.
- GPT는 **결과 카드 안의 「Lay-Z 맞춤 코멘트」** 용도로만 쓰이며, 다음 **임시 상수·함수**로 프롬프트가 정리되어 있습니다 (추후 기획·카피에 맞게 바꿀 것).
  - `LAYZ_AI_SYSTEM_PROMPT_PROTOTYPE` — 레이레이 브랜드 톤·금지사항 등 **역할 초안**(임의).
  - `buildLayzInsightUserPrompt(ctx)` — 점수·단계명·카드 요약·키워드만 넣어 **짧은 한국어 코멘트**를 요청하는 **유저 턴 초안**(임의).
- 퀴즈 **각 문항 선택 텍스트**까지 GPT에 넣지는 않았습니다. 나중에 “답변 기반 깊은 해석”이 필요하면 `ctx`(또는 `st.answers`)를 확장해서 프롬프트만 보강하면 됩니다.

**정리:** Lay-몽 = 기존 대형 사용자 프롬프트 완비. Lay-Z = **별도 레이블용 통합 원고는 없었고**, 현재는 **임의 초안 두 블록**(시스템 + 유저 조립 함수)만 있는 상태입니다.

---

## 3. Lay-Z력 테스트 (`site/sim/layz.html`) — AI가 의미 있게 붙는 지점

| 구간 | 설명 |
|------|------|
| **`#app` (`data-laylay-ai="layz-screen-host"`)** | 인트로·퀴즈·결과 화면 전체가 렌더링되는 루트. 퀴즈 응답(`pick` → `doResult`)까지는 **현재 로직 점수 계산**이고, GPT는 여기에 **추가 해석**만 얹는 형태가 자연스럽습니다. |
| **결과 카드 `renderResult()`** | 이미 디자인된 Lay-Z 카드 안에 **`#layz-ai-slot-root` (`data-laylay-ai="layz-personal-comment"`)** 가 있습니다. **「AI 코멘트 생성하기」** 를 누면, 상위 패널에 저장된 키와 세션 모델로 `/api/openai-dev` 에 요청해 **짧은 맞춤 코멘트**를 채워 넣는 흐름입니다. |

요약하면, **Lay-Z 본 테스트 점수·티어 표시는 기존 그대로**이고, **GPT는 결과 화면의「Lay-Z 맞춤 코멘트」블록**이 대표적인 AI 확장 포인트입니다.

---

## 4. Lay-몽 (`site/sim/lay-mong.html`) — AI가 의미 있게 붙는 지점

| 구간 | `data-laylay-ai` (참조용) | 설명 |
|------|---------------------------|------|
| 입력 폼 | `dream-form-context` (`#s-form`) | `#dream` 텍스트, 생년·시간·기분 등이 모여 **한 통의 프롬프트 문자열**로 `startDream()` 에서 조립됩니다. |
| 로딩 | `dream-await-upstream` (`#s-load`) | GPT 응답을 기다리는 동안 보이는 스텝. |
| 해몽 카드 렌더 | `dream-json-to-card` (`#mong-ai-slot` 등) | API가 반환해야 하는 **고정 JSON 스키마**를 파싱해 **운세 카드 UI**가 채워집니다. 실제 호출은 **`startDream()` → `/api/openai-dev`** 입니다. |
| 레이도감 | `dream-feed-note` (`#mong-feed-ai-slot`) | 현재는 **시드 데이터 + 사용자 해몽 저장** 피드. 향후 **요약 문구 생성·추천** 같은 GPT 후보 영역입니다. |

**키 저장:** 폼에서 「해몽 시작하기」를 누를 때 `localStorage.laylay_dev_openai_key` 가 없으면 **Mock 카드**로 대체되며 토스트로 안내합니다. 키는 상위 페이지 GPT 패널에서 넣어두면 iframe과 **동일 도메인**에서 공유됩니다.

---

## 5. 참고 파일

| 파일 | 역할 |
|------|------|
| `site/index.html` | 시뮬 탭 전환 + GPT 패널 UI |
| `netlify/functions/openai-dev-chat.js` | OpenAI Chat Completions 프록시 (CORS 회피) |
| `netlify.toml` | `/api/openai-dev` 리다이렉트 |
| `site/sim/layz.html` | Lay-Z 시뮬 + 결과 코멘트 슬롯 |
| `site/sim/lay-mong.html` | Lay-몽 시뮬 + GPT JSON 해몽 |

---

문의나 모델·프롬프트 조정이 필요하면 편하게 회신 주세요.

감사합니다.

---

*본 문서는 내부 공유·메일 붙여넣기용으로 작성되었습니다.*
