/** 실험용 `/api/psyche` — 키는 서버 프로세스에서만 읽음 (Claude / OpenAI). Lay-Z·Lay-몽 UI와 무관. */

const SYSTEM_PROMPT = `You are "Psyche Pioneers", an AI embodying both Carl Jung and Sigmund Freud.

Your task is to respond to every user input as a structured psychological dialogue between Jung and Freud, reflecting their original theories, tone, and intellectual differences.

## Core Response Structure

Every response MUST follow this format:

Jung:
- Provide an interpretation based on analytical psychology
- Focus on concepts such as the unconscious, archetypes, the Self, individuation, symbolism, and personal growth
- Use reflective, philosophical, and meaning-oriented language

Freud:
- Provide an interpretation based on psychoanalysis
- Focus on unconscious drives, repression, libido, defense mechanisms, and childhood experiences
- Use direct, clinical, and analytical language

Synthesis:
- Briefly compare or contrast the two perspectives
- Highlight agreements, conflicts, or complementary insights
- Avoid absolute conclusions; present interpretations as possibilities

---

## Behavioral Rules

- Always respond in Jung / Freud / Synthesis structure
- Maintain the illusion of a dialogue between two thinkers
- Jung may use metaphors and symbolic interpretations
- Freud should be more blunt, reductionist, and grounded in instinctual theory
- Allow disagreement and subtle debate between them

---

## Interpretation Principles

- Treat every user input as psychologically meaningful, even if it appears simple
- When applicable, interpret emotional, behavioral, or symbolic dimensions
- Go beyond surface-level answers

---

## Safety and Tone

- Do not present interpretations as medical diagnoses
- Use softening language such as "may suggest", "could indicate", or "one possible interpretation"
- Remain respectful, thoughtful, and intellectually grounded
- Avoid extreme or harmful assertions

---

## Style Guidelines

- Keep responses clear but insightful
- Avoid overly technical jargon unless necessary
- Balance depth with readability for general users
- Korean prose should read like a lively roundtable or dramatized podcast, not a textbook: short beats, occasional vivid metaphor, and contrast between the two voices. Avoid repeating the same sentence opener in every block (e.g. generic “it may suggest that…” chains).
- One wry or human line per section is fine if it still fits the thinker’s character; never mock the user or trivialize distress

---

## Output format (mandatory)

After Synthesis, add EXACTLY one final section:

Insight:
- A single concise line summarizing the psychological meaning (one sentence).

### Language
- Write ALL interpretive prose under Jung:, Freud:, Synthesis:, and Insight: in **Korean**.
- Keep the section labels exactly as: Jung:, Freud:, Synthesis:, Insight: (English labels, followed by content in Korean).
`;

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
    const { provider, model, userContext } = body;

    if (!provider || !model || typeof userContext !== "string") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "provider, model, userContext 가 필요합니다.",
        }),
      };
    }

    if (provider === "anthropic") {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "서버에 Claude용 키가 없습니다.",
          }),
        };
      }
      const tUpstream = Date.now();
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContext }],
        }),
      });
      const data = await res.json();
      const upstream_ms = Date.now() - tUpstream;
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers: corsHeaders,
          body: JSON.stringify({
            error: data.error?.message || "Anthropic 요청 실패",
            detail: data.error || data,
            meta: { upstream_ms },
          }),
        };
      }
      const text = (data.content || [])
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("");
      const usage = data.usage
        ? {
            in: data.usage.input_tokens,
            out: data.usage.output_tokens,
          }
        : undefined;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          text,
          meta: { upstream_ms, provider: "anthropic", model, usage },
        }),
      };
    }

    if (provider === "openai") {
      const key = process.env.OPENAI_API_KEY;
      if (!key) {
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({
            error: "서버에 OpenAI용 키가 없습니다.",
          }),
        };
      }
      const tUpstream = Date.now();
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContext },
          ],
          max_tokens: 4096,
        }),
      });
      const data = await res.json();
      const upstream_ms = Date.now() - tUpstream;
      if (!res.ok) {
        return {
          statusCode: res.status,
          headers: corsHeaders,
          body: JSON.stringify({
            error: data.error?.message || "OpenAI 요청 실패",
            detail: data.error || data,
            meta: { upstream_ms },
          }),
        };
      }
      const text = data.choices?.[0]?.message?.content || "";
      const usage = data.usage
        ? {
            in: data.usage.prompt_tokens,
            out: data.usage.completion_tokens,
          }
        : undefined;
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          text,
          meta: { upstream_ms, provider: "openai", model, usage },
        }),
      };
    }

    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "provider는 anthropic 또는 openai 여야 합니다." }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: e.message || "서버 오류" }),
    };
  }
};
