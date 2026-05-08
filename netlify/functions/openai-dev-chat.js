/**
 * 개발 전용: 클라이언트에서 전달한 OpenAI API 키로 Chat Completions 호출 (CORS 프록시).
 * 프로덕션 서비스 용도로는 사용하지 마세요 — 키가 클라이언트 경로를 통과합니다.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

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
    const { apiKey, model, prompt, messages, temperature, max_tokens } = body;
    const requestKey = typeof apiKey === "string" ? apiKey.trim() : "";
    const envKey =
      typeof process.env.OPENAI_API_KEY === "string"
        ? process.env.OPENAI_API_KEY.trim()
        : "";
    const effectiveKey = requestKey || envKey;
    if (!effectiveKey) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "apiKey 가 필요합니다. (또는 서버 OPENAI_API_KEY 설정)",
          mode: "no-key",
        }),
      };
    }
    const mdl = typeof model === "string" && model.trim() ? model.trim() : "gpt-4o-mini";
    let msgs = Array.isArray(messages) ? messages : null;
    if (!msgs || msgs.length === 0) {
      if (typeof prompt !== "string" || !prompt.trim()) {
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "prompt 또는 messages 가 필요합니다.",
          }),
        };
      }
      msgs = [{ role: "user", content: prompt.trim() }];
    }

    const payload = {
      model: mdl,
      messages: msgs.map((msg) => ({
        role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
        content: typeof msg.content === "string" ? msg.content : String(msg.content ?? ""),
      })),
    };
    /** o*-계열 채팅 모델은 temperature 등을 허용하지 않는 경우가 많음 */
    const skipChatParams = /^o\d+[/-]?|^o1|^o3/i.test(mdl);
    const tempNum = typeof temperature === "number" ? temperature : parseFloat(temperature);
    if (
      !skipChatParams &&
      !Number.isNaN(tempNum) &&
      tempNum >= 0 &&
      tempNum <= 2
    ) {
      payload.temperature = tempNum;
    }
    const maxTok = typeof max_tokens === "number" ? max_tokens : parseInt(max_tokens, 10);
    if (!skipChatParams && !Number.isNaN(maxTok) && maxTok > 0 && maxTok <= 16384) {
      payload.max_tokens = maxTok;
    }

    const tUpstream = Date.now();
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const upstream_ms = Date.now() - tUpstream;

    if (!res.ok) {
      return {
        statusCode: res.status >= 400 && res.status < 600 ? res.status : 502,
        headers: corsHeaders,
        body: JSON.stringify({
          error: data.error?.message || "OpenAI 요청 실패",
          detail: data.error || null,
          meta: { upstream_ms },
        }),
      };
    }

    const text = data.choices?.[0]?.message?.content ?? "";
    const usage = data.usage
      ? {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
        }
      : undefined;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        text,
        raw: data,
        meta: {
          upstream_ms,
          model: mdl,
          usage,
          auth_source: requestKey ? "request" : "server_env",
        },
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message || "서버 오류" }),
    };
  }
};
