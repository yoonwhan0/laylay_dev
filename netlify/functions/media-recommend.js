/**
 * Lay-Z v3: 점수 구간에 따라 YouTube/영화 추천 + 실제 watch 링크·썸네일
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

/** YouTube WEB 클라이언트의 공개 Innertube 키 (프론트엔드에 포함되는 값) */
const YT_INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

function mediaPlan(score) {
  const lz = Number(score) || 0;
  if (lz <= 39) {
    return {
      kind: "youtube",
      label: "유튜브 추천",
      intent: "가벼운 활력·스트레칭·짧은 동기부여 영상",
      querySeed: "아침 스트레칭 10분 한국어",
    };
  }
  if (lz <= 69) {
    return {
      kind: "movie",
      label: "영화 추천",
      intent: "위로·힐링·가볍게 보기 좋은 영화",
      querySeed: "힐링 영화 추천",
    };
  }
  return {
    kind: "youtube",
    label: "유튜브 추천",
    intent: "수면·명상·이불 속 힐링 ASMR/수면 영상",
    querySeed: "수면 명상 ASMR 한국어",
  };
}

function youtubeWatchUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

function youtubeSearchUrl(q) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}

function movieSearchUrl(q) {
  return `https://search.naver.com/search.naver?where=nexearch&sm=top_hty&query=${encodeURIComponent(
    `${q} 영화`
  )}`;
}

function youtubeThumb(videoId) {
  if (!videoId) return "";
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function extractVideoId(text) {
  if (!text) return "";
  const s = String(text).trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m && m[1]) return m[1];
  }
  return "";
}

function collectVideoIds(text, limit = 12) {
  const ids = [];
  const seen = new Set();
  const re = /"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/g;
  let m;
  while ((m = re.exec(text)) && ids.length < limit) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    ids.push(m[1]);
  }
  return ids;
}

function titleNearVideoId(text, videoId) {
  if (!text || !videoId) return "";
  const idx = text.indexOf(`"videoId":"${videoId}"`);
  if (idx < 0) return "";
  const window = text.slice(Math.max(0, idx - 500), idx + 900);
  const patterns = [
    /"title"\s*:\s*\{\s*"runs"\s*:\s*\[\s*\{\s*"text"\s*:\s*"([^"]+)"/,
    /"title"\s*:\s*\{\s*"simpleText"\s*:\s*"([^"]+)"/,
    /"accessibility"\s*:\s*\{\s*"accessibilityData"\s*:\s*\{\s*"label"\s*:\s*"([^"]+)"/,
  ];
  for (const re of patterns) {
    const m = window.match(re);
    if (m && m[1]) {
      return m[1]
        .replace(/\\u0026/g, "&")
        .replace(/\\"/g, '"')
        .trim();
    }
  }
  return "";
}

async function duckDuckGoHints(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
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

async function youtubeApiSearchOne(query, apiKey) {
  if (!apiKey || !query) return null;
  try {
    const url =
      "https://www.googleapis.com/youtube/v3/search?" +
      new URLSearchParams({
        part: "snippet",
        type: "video",
        maxResults: "1",
        q: query,
        key: apiKey,
        relevanceLanguage: "ko",
        safeSearch: "moderate",
      }).toString();
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const it = (data.items || [])[0];
    if (!it || !it.id || !it.id.videoId) return null;
    const sn = it.snippet || {};
    const id = it.id.videoId;
    const thumb =
      (sn.thumbnails &&
        (sn.thumbnails.high || sn.thumbnails.medium || sn.thumbnails.default) &&
        (sn.thumbnails.high || sn.thumbnails.medium || sn.thumbnails.default).url) ||
      youtubeThumb(id);
    return {
      title: sn.title || query,
      channel: sn.channelTitle || "",
      videoId: id,
      url: youtubeWatchUrl(id),
      thumb,
    };
  } catch (_) {
    return null;
  }
}

async function youtubeInnertubeSearch(query, limit = 5) {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://www.youtube.com/youtubei/v1/search?prettyPrint=false&key=${YT_INNERTUBE_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20240101.00.00",
              hl: "ko",
              gl: "KR",
            },
          },
          query: String(query),
        }),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const text = JSON.stringify(data);
    const ids = collectVideoIds(text, limit * 3);
    return ids.slice(0, limit).map((id) => ({
      title: titleNearVideoId(text, id) || query,
      videoId: id,
      url: youtubeWatchUrl(id),
      thumb: youtubeThumb(id),
    }));
  } catch (_) {
    return [];
  }
}

async function youtubeInnertubeSearchOne(query) {
  const list = await youtubeInnertubeSearch(query, 3);
  return list[0] || null;
}

async function verifyYoutubeId(videoId) {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return false;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeWatchUrl(videoId))}&format=json`);
    return res.ok;
  } catch (_) {
    return false;
  }
}

async function oembedYoutube(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeWatchUrl(videoId))}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title || "",
      channel: data.author_name || "",
      videoId,
      url: youtubeWatchUrl(videoId),
      thumb: data.thumbnail_url || youtubeThumb(videoId),
    };
  } catch (_) {
    return null;
  }
}

async function resolveYoutubeItem(query, title, youtubeKey, preferredId, usedIds) {
  const used = usedIds || new Set();
  const knownId = extractVideoId(preferredId) || extractVideoId(query) || extractVideoId(title);

  if (knownId && !used.has(knownId)) {
    const ok = await verifyYoutubeId(knownId);
    if (ok) {
      const meta = (await oembedYoutube(knownId)) || {
        title: title || query,
        videoId: knownId,
        url: youtubeWatchUrl(knownId),
        thumb: youtubeThumb(knownId),
      };
      used.add(knownId);
      return meta;
    }
  }

  if (youtubeKey) {
    const fromApi = await youtubeApiSearchOne(query || title, youtubeKey);
    if (fromApi && fromApi.videoId && !used.has(fromApi.videoId)) {
      used.add(fromApi.videoId);
      return fromApi;
    }
  }

  const candidates = await youtubeInnertubeSearch(query || title, 6);
  for (const hit of candidates) {
    if (!hit.videoId || used.has(hit.videoId)) continue;
    used.add(hit.videoId);
    const meta = (await oembedYoutube(hit.videoId)) || hit;
    return meta;
  }

  // 제목으로 한 번 더
  if (title && title !== query) {
    const more = await youtubeInnertubeSearch(title, 4);
    for (const hit of more) {
      if (!hit.videoId || used.has(hit.videoId)) continue;
      used.add(hit.videoId);
      const meta = (await oembedYoutube(hit.videoId)) || hit;
      return meta;
    }
  }

  return null;
}

async function omdbPoster(title, apiKey) {
  if (!apiKey || !title) return "";
  try {
    const url =
      "https://www.omdbapi.com/?" +
      new URLSearchParams({
        t: title,
        apikey: apiKey,
        type: "movie",
      }).toString();
    const res = await fetch(url);
    if (!res.ok) return "";
    const data = await res.json();
    if (data && data.Poster && data.Poster !== "N/A") return data.Poster;
    return "";
  } catch (_) {
    return "";
  }
}

async function itunesMoviePoster(title) {
  if (!title) return null;
  try {
    const url =
      "https://itunes.apple.com/search?" +
      new URLSearchParams({
        term: title,
        entity: "movie",
        limit: "1",
        country: "KR",
        lang: "ko_kr",
      }).toString();
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = (data.results || [])[0];
    if (!hit) return null;
    const art = hit.artworkUrl100 || hit.artworkUrl60 || "";
    const thumb = art ? art.replace(/100x100bb/, "600x600bb").replace(/60x60bb/, "600x600bb") : "";
    return {
      title: hit.trackName || title,
      thumb,
      url: hit.trackViewUrl || "",
    };
  } catch (_) {
    return null;
  }
}

async function resolveMovieItem(title, query, omdbKey) {
  const name = (title || query || "").replace(/\s*영화\s*$/, "").trim();
  const omdb = await omdbPoster(name, omdbKey);
  if (omdb) {
    return { title: name, thumb: omdb, url: "" };
  }
  const itunes = await itunesMoviePoster(name);
  if (itunes && itunes.thumb) {
    return {
      title: itunes.title || name,
      thumb: itunes.thumb,
      url: itunes.url || "",
    };
  }
  return { title: name, thumb: "", url: "" };
}

async function openAiCurate({ key, model, score, mode, plan, webHints }) {
  const system = [
    "당신은 Lay-Z Check의 콘텐츠 큐레이터입니다.",
    "사용자의 Lay-Z 점수와 모드에 맞춰 오늘 보기 좋은 콘텐츠 3개를 고릅니다.",
    "웹검색 힌트가 있으면 참고하되, 실제로 검색 가능한 구체적 제목/키워드로 작성하세요.",
    "의학 진단처럼 말하지 마세요.",
    '반드시 JSON만 출력: {"sectionTitle":"…","items":[{"title":"…","reason":"…","query":"…","videoId":"…"}]}',
    "items는 정확히 3개. reason은 1~2문장. query는 검색용 짧은 키워드.",
    "유튜브면 query를 실제 검색에 잘 걸리는 한국어 키워드로 쓰고, 확실한 videoId가 있을 때만 넣고 없으면 빈 문자열.",
    "영화면 videoId는 빈 문자열, title은 정확한 영화 제목.",
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
      ? "유튜브 영상 3개를 추천하세요. query는 유튜브 검색 키워드. videoId는 확실할 때만."
      : "영화 3편을 추천하세요. title은 포스터 검색 가능한 정확한 제목.",
  ].join("\n");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model || "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 1400,
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
        { title: "패딩턴", reason: "부담 없이 마음이 풀리는 따뜻한 코미디예요.", query: "패딩턴" },
        {
          title: "리틀 포레스트",
          reason: "조용히 리듬을 되돌리고 싶을 때 좋은 힐링작이에요.",
          query: "리틀 포레스트",
        },
        { title: "코코", reason: "감정은 건드리지만 결국 따뜻하게 남는 이야기예요.", query: "코코" },
      ],
    };
  }
  if (plan.querySeed.includes("수면") || plan.querySeed.includes("ASMR")) {
    return {
      sectionTitle: "오늘 점수에 맞는 유튜브 추천",
      items: [
        {
          title: "수면 명상",
          reason: "호흡을 천천히 내려놓고 싶을 때 맞춰보세요.",
          query: "수면 명상 가이드 한국어",
        },
        {
          title: "빗소리 수면 ASMR",
          reason: "화면을 크게 볼 필요 없이 귀로만 쉬기 좋아요.",
          query: "빗소리 수면 ASMR",
        },
        {
          title: "수면 전 스트레칭",
          reason: "누운 채로도 몸을 살짝 풀어주는 짧은 루틴이에요.",
          query: "수면 전 스트레칭 10분",
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
        title: "전신 스트레칭",
        reason: "몸을 조금 깨우고 싶을 때 따라 하기 좋은 영상이에요.",
        query: "전신 스트레칭 10분 초보",
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
    const omdbKey =
      typeof process.env.OMDB_API_KEY === "string" ? process.env.OMDB_API_KEY.trim() : "";

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

    const rawItems = curated.items.slice(0, 3);
    const usedIds = new Set();

    // 유튜브는 순차 처리해 중복 videoId를 피하고, 실패 시 querySeed로 보충
    const items = [];
    if (plan.kind === "youtube") {
      for (let idx = 0; idx < rawItems.length; idx++) {
        const it = rawItems[idx];
        const title = String(it.title || "").trim() || `추천 ${idx + 1}`;
        const reason = String(it.reason || "").trim();
        const query = String(it.query || title || plan.querySeed).trim();
        let resolved = await resolveYoutubeItem(query, title, youtubeKey, it.videoId || "", usedIds);
        if (!resolved) {
          resolved = await resolveYoutubeItem(plan.querySeed, title, youtubeKey, "", usedIds);
        }
        items.push({
          kind: "youtube",
          title: (resolved && resolved.title) || title,
          reason,
          query,
          url: (resolved && resolved.url) || youtubeSearchUrl(query),
          thumb: (resolved && resolved.thumb) || "",
          videoId: (resolved && resolved.videoId) || "",
        });
      }

      // 그래도 비어 있으면 seed 검색 결과로 강제 채움
      const needFill = items.filter((x) => !x.videoId);
      if (needFill.length) {
        const seedHits = await youtubeInnertubeSearch(plan.querySeed, 8);
        let si = 0;
        for (const item of items) {
          if (item.videoId) continue;
          while (si < seedHits.length && usedIds.has(seedHits[si].videoId)) si++;
          if (si >= seedHits.length) break;
          const hit = seedHits[si++];
          usedIds.add(hit.videoId);
          const meta = (await oembedYoutube(hit.videoId)) || hit;
          item.title = meta.title || item.title;
          item.url = meta.url;
          item.thumb = meta.thumb;
          item.videoId = meta.videoId;
        }
      }
    } else {
      for (let idx = 0; idx < rawItems.length; idx++) {
        const it = rawItems[idx];
        const title = String(it.title || "").trim() || `추천 ${idx + 1}`;
        const reason = String(it.reason || "").trim();
        const query = String(it.query || title).trim();
        const movie = await resolveMovieItem(title, query, omdbKey);
        items.push({
          kind: "movie",
          title: (movie && movie.title) || title,
          reason,
          query,
          url: (movie && movie.url) || movieSearchUrl(query || title),
          thumb: (movie && movie.thumb) || "",
          videoId: "",
        });
      }
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        kind: plan.kind,
        label: plan.label,
        sectionTitle: curated.sectionTitle || `오늘 점수에 맞는 ${plan.label}`,
        scoreBand: score <= 39 ? "0-39" : score <= 69 ? "40-69" : "70-99",
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
