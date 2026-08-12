/**
 * Lay-Z v3: 점수 구간에 따라 YouTube 또는 영화 추천을 AI + 웹검색으로 생성
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function mediaPlan(score) {
  const lz = Number(score) || 0;
  if (lz <= 39) {
    return {
      kind: "youtube",
      label: "유튜브 추천",
      intent: "가벼운 활력·스트레칭·짧은 동기부여 영상",
      querySeed: "스트레칭 루틴 짧은 영상 추천",
    };
  }
  if (lz <= 69) {
    return {
      kind: "movie",
      label: "영화 추천",
      intent: "위로·힐링·가볍게 보기 좋은 영화",
      querySeed: "힐링 영화 추천 넷플릭스",
    };
  }
  return {
    kind: "youtube",
    label: "유튜브 추천",
    intent: "수면·명상·이불 속 힐링 ASMR/수면 영상",
    querySeed: "수면 명상 ASMR 추천",
  };
}

function youtubeSearchUrl(q) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

function movieSearchUrl(q) {
  return `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&query=${encodeURIComponent(
    `${q} 영화`
  )}`;
}

async function duckDuckGoHints(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const hints = [];
    if (data.Heading) hints.push(String(data.Heading));
    if (data.AbstractText) hints.push(String(data.AbstractText).slice(0, 180));
    const related = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
    related.slice(0, 6).forEach((t) => {
      if (t && typeof t.Text === "string") hints.push(t.Text.slice(0, 120));
      if (t && Array.isArray(t.Topics)) {
        t.Topics.slice(0, 2).forEach((x) => {
          if (x && typeof x.Text === "string") hints.push(x.Text.slice(0, 120));
        });
      }
    });
    return hints.filter(Boolean).slice(0, 8);
  } catch (_) {
    return [];
  }
}

async function youtubeApiItems(query, apiKey) {
  if (!apiKey) return [];
  try {
    const url =
      "https://www.googleapis.com/youtube/v3/search?" +
      new URLSearchParams({
        part: "snippet",
        type: "video",
        maxResults: "3",
        q: query,
        key: apiKey,
        relevanceLanguage: "ko",
        safeSearch: "moderate",
      }).toString();
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || [])
      .map((it) => {
        const id = it.id && it.id.videoId;
        const sn = it.snippet || {};
        if (!id) return null;
        return {
          title: sn.title || query,
          reason: sn.channelTitle ? `${sn.channelTitle} 채널` : "유튜브 검색 결과",
          url: `https://www.youtube.com/watch?v=${id}`,
          thumb: sn.thumbnails && sn.thumbnails.medium ? sn.thumbnails.medium.url : "",
        };
      })
      .filter(Boolean);
  } catch (_) {
    return [];
  }
}

async function openAiCurate({ key, model, score, mode, plan, webHints }) {
  const system = [
    "당신은 Lay-Z Check의 콘텐츠 큐레이터입니다.",
    "사용자의 Lay-Z 점수와 모드에 맞춰 오늘 보기 좋은 콘텐츠 3개를 고릅니다.",
    "웹검색 힌트가 있으면 참고하되, 실제로 검색 가능한 구체적 제목/키워드로 작성하세요.",
    "의학 진단처럼 말하지 마세요.",
    "반드시 JSON만 출력: {\"sectionTitle\":\"…\",\"items\":[{\"title\":\"…\",\"reason\":\"…\",\"query\":\"…\"}]}",
    "items는 정확히 3개. reason은 1~2문장. query는 검색용 짧은 한글/영어 키워드.",
  ].join("\n");

  const user = [
    `Lay-Z 지수: ${score}`,
    `Mode: ${mode || ""}`,
    `추천 종류: ${plan.kind} (${plan.label})`,
    `의도: ${plan.intent}`,
    `기본 검색어: ${plan.querySeed}`,
    webHints.length ? `웹검색 힌트:\n- ${webHints.join("\n- ")}` : "웹검색 힌트 없음",
    "",
    plan.kind === "youtube"
      ? "유튜브 영상 3개를 추천하세요. query는 유튜브 검색에 바로 쓸 키워드."
      : "영화 3편을 추천하세요. query는 영화 제목 위주 검색어.",
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return null;
  const raw = data.choices?.[0]?.message?.content || "";
  const m = String(raw).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch (_) {
    return null;
  }
}

function fallbackItems(plan) {
  if (plan.kind === "movie") {
    return {
      sectionTitle: "오늘 점수에 맞는 영화 추천",
      items: [
        {
          title: "패딩턴",
          reason: "부담 없이 마음이 풀리는 따뜻한 코미디예요.",
          query: "패딩턴 영화",
        },
        {
          title: "리틀 포레스트",
          reason: "조용히 리듬을 되돌리고 싶을 때 좋은 힐링작이에요.",
          query: "리틀 포레스트 영화",
        },
        {
          title: "코코",
          reason: "감정은 건드리지만 결국 따뜻하게 남는 이야기예요.",
          query: "코코 영화",
        },
      ],
    };
  }
  if (plan.querySeed.includes("수면")) {
    return {
      sectionTitle: "오늘 점수에 맞는 유튜브 추천",
      items: [
        {
          title: "수면 명상 가이드",
          reason: "호흡을 천천히 내려놓고 싶을 때 맞춰보세요.",
          query: "수면 명상 가이드 한국어",
        },
        {
          title: "빗소리 수면 ASMR",
          reason: "화면을 크게 볼 필요 없이 귀로만 쉬기 좋아요.",
          query: "빗소리 수면 ASMR",
        },
        {
          title: "이완 스트레칭 10분",
          reason: "누운 채로도 몸을 살짝 풀어주는 짧은 루틴이에요.",
          query: "침대 스트레칭 수면 전",
        },
      ],
    };
  }
  return {
    sectionTitle: "오늘 점수에 맞는 유튜브 추천",
    items: [
      {
        title: "아침 스트레칭 10분",
        reason: "짧고 가볍게 몸을 깨우기 좋은 루틴이에요.",
        query: "아침 스트레칭 10분",
      },
      {
        title: "책상 스트레칭",
        reason: "오래 앉아 피로가 쌓였을 때 바로 따라 하기 좋아요.",
        query: "사무실 스트레칭 짧은",
      },
      {
        title: "모닝 동기부여 숏폼",
        reason: "길게 볼 필요 없이 기분만 살짝 올려보세요.",
        query: "동기부여 짧은 영상 한국어",
      },
    ],
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const score = Number(body.score);
    const mode = body.mode || {};
    const modeLabel = mode.label || mode.name || "";
    const plan = mediaPlan(score);
    const envKey =
      typeof process.env.OPENAI_API_KEY === "string" ? process.env.OPENAI_API_KEY.trim() : "";
    const requestKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    const key = requestKey || envKey;
    const model =
      (typeof body.model === "string" && body.model.trim()) ||
      process.env.OPENAI_MODEL ||
      "gpt-4o-mini";
    const youtubeKey =
      typeof process.env.YOUTUBE_API_KEY === "string" ? process.env.YOUTUBE_API_KEY.trim() : "";

    const webHints = await duckDuckGoHints(`${plan.querySeed} ${modeLabel}`.trim());
    let curated = null;
    if (key) {
      curated = await openAiCurate({
        key,
        model,
        score,
        mode: modeLabel,
        plan,
        webHints,
      });
    }
    if (!curated || !Array.isArray(curated.items) || curated.items.length < 3) {
      curated = fallbackItems(plan);
    }

    let ytApi = [];
    if (plan.kind === "youtube" && youtubeKey && curated.items[0]?.query) {
      ytApi = await youtubeApiItems(curated.items[0].query, youtubeKey);
    }

    const items = curated.items.slice(0, 3).map((it, idx) => {
      const title = String(it.title || "").trim() || `추천 ${idx + 1}`;
      const reason = String(it.reason || "").trim();
      const query = String(it.query || title).trim();
      if (plan.kind === "youtube" && ytApi[idx]) {
        return {
          kind: "youtube",
          title: ytApi[idx].title || title,
          reason: reason || ytApi[idx].reason,
          query,
          url: ytApi[idx].url,
          thumb: ytApi[idx].thumb || "",
        };
      }
      return {
        kind: plan.kind,
        title,
        reason,
        query,
        url: plan.kind === "youtube" ? youtubeSearchUrl(query) : movieSearchUrl(query),
        thumb: "",
      };
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        kind: plan.kind,
        label: plan.label,
        sectionTitle: curated.sectionTitle || `오늘 점수에 맞는 ${plan.label}`,
        scoreBand:
          score <= 39 ? "0-39" : score <= 69 ? "40-69" : "70-99",
        intent: plan.intent,
        webHints,
        items,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err.message || "media recommend failed" }),
    };
  }
};
