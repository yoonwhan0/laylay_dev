# Layaly 시뮬 (Lay-Z / Lay-몽)

정적 프론트와 Netlify Functions로 구성된 데모 프로젝트입니다.

## 폴더 구조

| 경로 | 설명 |
|------|------|
| `site/` | 배포되는 정적 사이트 루트 (`index.html` 진입) |
| `site/sim/layz.html` | Lay-Z력 테스트 시뮬 |
| `site/sim/lay-mong.html` | Lay-몽 시뮬 |
| `netlify/functions/` | 서버리스 API (`/api/openai-dev`, `/api/psyche` 등) |
| `docs/` | 제품·프롬프트·테스트·환경변수 안내 |

## 로컬 실행

1. [Netlify CLI](https://docs.netlify.com/cli/get-started/) 설치 후 저장소 루트에서:

   ```bash
   netlify dev
   ```

2. 브라우저에서 `http://localhost:8888/` (CLI 안내 포트 기준)로 접속합니다.

Functions가 OpenAI 등을 호출하는 경우, Netlify 환경 변수에 `OPENAI_API_KEY`를 설정합니다. 자세한 용어는 `docs/넷리파이-환경변수-용어.md`를 참고하세요.

## 배포

`netlify.toml`의 `publish = "site"` 기준으로 `site/`가 공개 디렉터리입니다.

## 문서

- `docs/SIMUL_PRODUCT_AND_PROMPTS.md` — 시뮬 구조·프롬프트 정리
- `docs/laylay-AI-테스트-안내.md` — AI 연동 테스트 포인트
- `docs/넷리파이-환경변수-용어.md` — Netlify 환경 변수 설명
