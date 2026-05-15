# Lay Lay 시뮬 (Lay-Z / Lay-몽)

브라우저에 올라가는 건 `site/` 아래 정적 파일이고, AI 호출은 같은 사이트 기준 경로 **`POST /api/openai-dev`** 로만 나갑니다. 실제 배포는 팀에서 쓰는 스택(예: PHP로 프록시·응답만 만들고 정적은 그대로 두는 방식 등)에 맞춰 붙이면 됩니다.

이 문서는 **개발사에 인계할 때 “어디에 무엇이 있는지” 한눈에 잡으려는** 목적입니다. HTML 안 인라인 `style=""` 은 모두 외부 CSS 클래스로 빼두었습니다(아래 “인라인 코드 분리 원칙” 참고).

---

## 1. 폴더·파일 매핑표 (전체)

```
layaly_dev/
├── README.md                  ← 이 문서
├── netlify/
│   └── functions/             ← 참고용 API 스텁 (PHP 등으로 교체 가능)
└── site/                      ← 브라우저에 올라가는 정적 파일 전부
    ├── index.html             ← 개발용 셸 (시뮬 탭 전환 + 모델 선택 + AI 담당 맵)
    ├── assets/
    │   ├── css/
    │   │   ├── shell.css
    │   │   ├── lay-mong.css
    │   │   └── layz.css
    │   └── js/
    │       ├── shell.js
    │       ├── lay-mong.js
    │       └── layz.js
    └── sim/
        ├── lay-mong.html      ← Lay-몽 시뮬 단독 페이지
        └── layz.html          ← Lay-Z 시뮬 단독 페이지
```

| 화면 / 모듈 | HTML | CSS | JS |
|---|---|---|---|
| **개발용 셸** (시뮬 전환·모델 선택·AI 담당 맵) | `site/index.html` | `site/assets/css/shell.css` | `site/assets/js/shell.js` |
| **Lay-몽** (꿈 입력 → 해몽 → 도감) | `site/sim/lay-mong.html` | `site/assets/css/lay-mong.css` | `site/assets/js/lay-mong.js` |
| **Lay-Z** (8문항 → 컨디션 점수 → 결과) | `site/sim/layz.html` | `site/assets/css/layz.css` | `site/assets/js/layz.js` |
| **API 스텁(참고)** | — | — | `netlify/functions/openai-dev-chat.js` 등 |

> HTML 파일 안에는 **`<style>` 블록이 없고** 인라인 `style="…"` 도 거의 없습니다. JS가 `style.display`로 직접 토글하는 자리(예: `#hd-hist`, `#dev-model-custom-wrap`, `#new-badge`)만 예외적으로 남아 있습니다.

---

## 2. AI 프롬프트 위치 (개발사가 가장 먼저 찾을 곳)

> **점수·폼·레이아웃은 코드가 고정**하고, 모델은 **“말”과 “JSON 필드”** 만 채웁니다.

| 시뮬 | 프롬프트 정의 파일 | 함수 / 변수 | 호출 경로 |
|---|---|---|---|
| **Lay-Z** | `site/assets/js/layz.js` | `fetchLayZCopy()` 안 `layzSystem` 배열 + 그 아래 `messages` 조립 | `POST /api/openai-dev` |
| **Lay-몽** | `site/assets/js/lay-mong.js` | `startDream()` 안 `laymongSystem` 배열 + `prompt` 템플릿 | `POST /api/openai-dev` |
| 셸 → 시뮬 모델 전달 | `site/assets/js/shell.js` | `postMessage({ source: 'laylay-shell', type: 'laylay-dev-sync', model })` | (브라우저 내 메시지) |

찾는 빠른 키워드:
- `layzSystem` 또는 `fetchLayZCopy` → Lay-Z 프롬프트
- `laymongSystem` 또는 `startDream` → Lay-몽 프롬프트

---

## 3. AI가 맡는 범위 · 프롬프트 상세

### 3-1. Lay-Z — `fetchLayZCopy()` (`site/assets/js/layz.js`)

| 항목 | 내용 |
|------|------|
| **호출** | `POST /api/openai-dev` |
| **메시지 형태** | `system` + `user` 두 턴 (배열 `messages`) |
| **온도·길이** | `temperature: 0.72`, `max_tokens: 2400` |

#### System (`layzSystem` — 줄마다 이어 붙인 한 덩어리)

모델에게 이렇게 역할을 고정합니다.

1. 브랜드 **「Lay-Z」 오늘 컨디션 카피 작가**다.
2. 말투는 **친근한 반말/해요체**도 되지만, 가볍고 유머 있게. **진부한 운세체·번역투·한자어 나열**은 피한다.
3. **의학·법률·투자·진단처럼 들리는 단정**은 금지. 재미·자기인식용이며 **점수는 이미 확정**이라 바꾸지 말 것.
4. 카피는 짧게 끊기지 말고: **공감**, **오늘 상태를 구체적으로**, **문항에서 드러난 뉘앙스를 한두 번은 직접 짚기**.
5. **출력은 JSON 한 덩어리만** (바깥 텍스트·마크다운·코드펜스 금지).
6. **Lay-Z 지수 숫자**는 사용자가 준 값이므로 **절대 바꾸거나 재해석하지 말 것**.

#### User (런타임에 조립되는 문자열)

모델에게 **참고 재료**를 줍니다.

- 8문항을 한 줄씩 요약한 목록 (`Qs` + 사용자가 고른 보기 텍스트).
- **고정 점수**: `Lay-Z 지수(고정·변경 금지): N`.
- **참고 티어**: 코드에서 이미 정한 `id`, 기본 이름, 기본 태그(색·구간은 고정, 이름/카피는 새로 써도 된다고 허용).

#### 모델이 보내야 하는 JSON

UI가 그대로 파싱합니다. 키 이름이 정확히 일치해야 합니다.

| 키 | 역할 |
|----|------|
| `tierName`, `tierTag` | 티어 표기용 이름·태그 (TIERS 기본값 대체 가능) |
| `head` | 짧은 헤드 카피 (2문장 이내 한 덩어리) |
| `desc` | 본문 (5~9문장, 공감·구체 묘사·가벼운 유머, 문항 요약에서 단서 2회 이상 인용하듯) |
| `recs` | 배열 **정확히 3개**. 각 `{ tag, title, desc }` — `desc`는 4~8문장 분량으로 행동 이유·기대·주의 |
| `rx` | 수면 가이드 `{ title, sub, items }` — `items`는 **정확히 3개**, 각 2~5문장으로 실천을 구체적으로 |

실패·파싱 오류 시에는 **`TIERS`에 박힌 고정 카피**로 화면이 깨지지 않게 합니다.

---

### 3-2. Lay-몽 — `startDream()` (`site/assets/js/lay-mong.js`)

| 항목 | 내용 |
|------|------|
| **호출** | `POST /api/openai-dev` |
| **메시지 형태** | `system` + `user` 두 턴 |
| **온도·길이** | `temperature: 0.68`, `max_tokens: 3200` |

#### System (`laymongSystem`)

꿈 해몽 **캐릭터·톤·금지·출력 형식**을 고정합니다.

1. 브랜드 **「Lay-몽」** 꿈 해석 캐릭터.
2. 말투: **밤에 친한 사람에게 카톡**하듯 따뜻하고 리듬 있게. 진부한 운세 멘트 반복, 번역투, 과한 한자어 나열은 피함.
3. 사용자 꿈 속 **구체 단어·사건·풍경**을 각 설명마다 **최소 한 번** 인용/짚어 **개인 맞춤**처럼 읽히게.
4. 가벼운 비유·한 줄 농은 가능하나 **농담만으로 끝내지 않음**. 재물/애정/직장/건강은 **서로 다르게** 서술.
5. 각 운세 설명·총론은 짧게 끊기지 말고 **공감·상징·다음 행동**으로 이어지게 넉넉히.
6. **JSON 한 덩어리만** (바깥 텍스트·마크다운·코드펜스 금지).
7. 운세는 재미·상징이며 **의학·법률·투자 조언이 아님** — **단정적 단언** 지양.

#### User (`prompt` 템플릿)

폼에서 모은 값이 문자열로 들어갑니다.

- 달력 종류·생년월일·성별·태어난 시간.
- 꿈을 적을 때 **기분** (텍스트 + 이모지).
- 꿈 본문은 `""" … """` 로 감싸서 전달 (길이·내용 그대로).

그 아래에 **문장 수·말투(~요/예요)·한줄평 규칙·해시태그 5개 규칙·별점 1~5** 등을 글로 반복 지시하고, 마지막에 **JSON 스키마 한 블록**으로 키 이름을 고정합니다.

#### 모델이 보내야 하는 JSON

| 키 | 역할 |
|----|------|
| `재물운` ~ `건강운` | 각 **정수 1~5** (5가 가장 좋음) |
| `재물운설명` 등 4개 | 각 **5~9문장**, ~요체, 꿈 내용을 여러 번 끼워 넣고 마지막에 **작은 행동 제안** 한 줄 |
| `총론설명` | **6~12문장**, 꿈 흐름 요약 + 기분과 연결해 위로·유머·여운 중 **둘 이상** |
| `한줄평` | **반드시 1문장**, 대략 36~52자 권장. 꿈에서 건진 이미지·비유 한 조각. 상투·설교·「오늘은」 남발 금지 |
| `행운의색`, `행운의숫자`, `행운의물건` | UI 카드에 그대로 표시 |
| `행동해시태그` | `#`으로 시작하는 문자열 **5개**, 가볍고 공유 욕구 나게 (조롱·위험·혐오 금지) |

실패 시에는 코드에 있는 **`MOCK` 상수**로 같은 키를 채워 UI를 유지합니다.

---

### 3-3. 셸 (`site/assets/js/shell.js`)

- iframe에 모델 문자열만 넘깁니다 (`postMessage`).
- 운영에서는 백엔드가 모델·키를 정하면 됩니다.

### 3-4. 구역 하이라이트

- HTML의 `data-laylay-region="…"` + 셸의 `COVERAGE_BY_SIM` 이 “이 영역이 AI 영역인지 / 고정 규칙인지” 매핑입니다.
- 우측 “AI 담당 영역” 패널의 항목을 누르면 시뮬 화면의 해당 구역이 빨갛게 깜빡입니다.

---

## 4. API · 백엔드 인터페이스

| 항목 | 값 |
|---|---|
| **엔드포인트** | `POST /api/openai-dev` |
| **요청 본문(JSON)** | `{ messages, model, temperature, max_tokens, ... }` (OpenAI Chat Completions 형태와 같음) |
| **응답** | `data.choices[0].message.content` 안에 **JSON 문자열** 한 덩어리 (위 스키마) |
| **참고 구현** | `netlify/functions/openai-dev-chat.js` (Node 기준 스텁) |

운영에서는 이 경로만 같은 오리진으로 응답을 내려주면 됩니다 — 프론트는 PHP/Node/Python 어떤 백엔드든 신경 쓰지 않습니다.

### 키·보안 원칙

- **API 키는 서버에서만** 갖고 있고, 브라우저·저장소로는 보내지 않는 구성이 기본입니다.
- 이 레포의 참고 스텁은 개발 편의상 요청 바디에 키를 실을 수도 있게 되어 있으나, 운영에서는 막고 **백엔드만 upstream(OpenAI 등)을 호출**하게 두는 게 맞습니다.

---

## 5. 결과 공유 (Lay-Z / Lay-몽 공통)

`getLaylayShareEnv()` 가 **환경(PC/모바일)을 감지해서** 그에 맞는 채널만 시트에 노출하도록 짜뒀습니다.

| 환경 | 기본(primary) | 같이 보이는 옵션 |
|------|----------------|------------------|
| 모바일 | **다른 앱으로 공유** (`navigator.share`) — 시스템 공유 시트에서 카톡·문자·메일 등 선택 | 카카오톡 / 문자(SMS) / 텍스트 복사 |
| PC | **카카오톡으로 보내기** (Kakao SDK 또는 클립보드 폴백) | 이메일(mailto) / 텍스트 복사 |

### 카카오톡으로 직접 보내기

코드는 이미 `window.Kakao` 존재만 확인하면 `Kakao.Share.sendDefault()`로 분기되도록 짜뒀습니다 (`mongShareKakao` / `kakaoShare`). SDK가 없거나 초기화 전이면 **자동으로 클립보드 복사 + 안내 토스트**로 떨어집니다.

키를 받아서 활성화하려면 두 시뮬 HTML(`site/sim/lay-mong.html`, `site/sim/layz.html`)의 `<head>`에 아래 두 줄을 추가하면 됩니다.

```html
<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js" integrity="..." crossorigin="anonymous"></script>
<script>window.Kakao && Kakao.init('YOUR_KAKAO_JAVASCRIPT_KEY');</script>
```

`Kakao Developers`에서 발급한 **JavaScript 키**를 넣고, **플랫폼·도메인 등록**(http/https 모두)을 해두면 PC·모바일 어디서든 카톡 공유창이 정상 동작합니다.

---

## 6. 인라인 코드 분리 원칙 (개발사 인계 시 참고)

이번 정리에서 따른 규칙:

- HTML 파일 안에 **`<style>` 블록 없음** — 모든 시각 스타일은 `site/assets/css/*.css` 에 있습니다.
- HTML 파일 안에 **`<script>` 블록 없음** — 모든 동작은 `site/assets/js/*.js` 에 있고 `<script defer src="…">` 로만 불러옵니다.
- HTML 안 인라인 `style="…"` 도 가능한 한 클래스로 옮겼습니다. **남아 있는 자리**는 다음과 같으며, JS가 직접 토글하는 자리라 의도적으로 둔 것입니다.
  - `site/sim/layz.html` `#hd-hist` (헤더 “내 기록” 버튼)
  - `site/sim/lay-mong.html` `#new-badge` (도감 NEW 배지)
  - `site/index.html` `#dev-model-custom-wrap` 은 `hidden` 속성으로 통일했습니다.
- HTML 안 `onclick="…"` 같은 **인라인 이벤트 핸들러는 의도적으로 유지**했습니다 — 디자이너/기획자가 HTML만 보고 “어떤 버튼이 어떤 함수를 부르는지” 바로 읽을 수 있게 하기 위함입니다. 운영에서 CSP 등으로 막을 거라면 일괄 교체가 필요합니다.

### 새 스타일/스크립트를 추가할 때

| 작업 | 어디에 추가 |
|---|---|
| Lay-몽 시각 변경 | `site/assets/css/lay-mong.css` |
| Lay-Z 시각 변경 | `site/assets/css/layz.css` |
| 셸(전환·AI 맵) 시각 변경 | `site/assets/css/shell.css` |
| Lay-몽 동작/프롬프트 변경 | `site/assets/js/lay-mong.js` |
| Lay-Z 동작/프롬프트 변경 | `site/assets/js/layz.js` |
| 셸 동작 변경 | `site/assets/js/shell.js` |

> HTML 파일은 **마크업과 클래스 이름만** 손대는 것을 기본으로 봐주세요.

---

## 7. 로컬에서 보기

프론트가 `fetch('/api/openai-dev', …)` 를 쓰므로, **HTML을 파일로만 열면** 브라우저 정책상 API가 안 붙는 경우가 많습니다. 로컬에서도 정적 + API를 **한 오리진**으로 서빙하는 방식으로 맞추면 됩니다 (예: 사내에서 쓰는 로컬 PHP 서버, 또는 임의의 정적 서버 + 별도 API 서버에 리버스 프록시).

---

## 8. 기타

- 유의사항 문구는 시뮬용입니다. 론칭 시 기획·법무 확정본으로 교체하세요.
- Lay-Z의 “상위 %” 등은 데모 성격입니다.
- `netlify/functions/` 는 단지 **참고용 API 스텁** 입니다 — 같은 경로 `/api/*` 를 PHP 등으로 바꿔도 프론트는 그대로 두면 됩니다.
