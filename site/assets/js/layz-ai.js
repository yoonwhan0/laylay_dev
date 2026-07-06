'use strict';

(function () {
  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  function buildAnswerProfile(answers, lz, mode, questions) {
    var a = answers || [];
    function pick(i) {
      return a[i] && a[i].label ? String(a[i].label) : '';
    }
    var fatigueSum = a.reduce(function (sum, x) {
      var s = typeof x === 'number' ? x : x && typeof x.score === 'number' ? x.score : 0;
      return sum + s;
    }, 0);
    var stance =
      lz <= 19
        ? '컨디션 여유 — 루틴 유지·예방 처방'
        : lz <= 39
          ? '경계선 — 슬슬 방전 신호, 가벼운 회복 처방'
          : lz <= 59
            ? '번아웃 예고 — 저녁·수면 우선 처방'
            : lz <= 79
              ? '강한 피로 — 오늘 밤 회복 집중 처방'
              : '극한 레이지 — 최소 부담·수면 최우선 처방';
    return [
      '=== 오늘 이 사람 포지션 (카피·처방의 출발점) ===',
      'Lay-Z 지수: ' + lz + '점 · 참고 구간: ' + (mode ? mode.label : ''),
      '종합 포지션: ' + stance,
      '누적 피로 신호(문항 점수 합, 높을수록 더 지침): ' + fatigueSum,
      ...a.map(function (ans, i) {
        var q = questions[i];
        var label = typeof ans === 'object' && ans.label ? ans.label : pick(i) || '(미응답)';
        return (i + 1) + '. ' + (q ? q.text.replace(/\n/g, ' ') : '문항') + ' → ' + label;
      }),
      '→ 위 포지션·문항 선택에서만 head·desc·recs·rx·summary를 쓸 것. 다른 사람에게도 맞는 문장 금지.',
    ].join('\n');
  }

  async function fetchCopy(lz, mode, answers, questions) {
    var layzSystem = [
      '당신은 브랜드 "Lay-Z Check"의 오늘 컨디션 코치이자 카피 작가입니다.',
      '역할: 사용자가 고른 8문항만 보고 「오늘 이 사람의 포지션」을 유추한 뒤, 그 포지션에서만 통하는 처방·공감·행동을 씁니다.',
      '말투: 친근한 반말/해요체 혼용 가능하나 가볍고 유머 있게. 진부한 운세체·번역투는 피합니다.',
      '의학·법률·투자·진단처럼 들리는 단정은 금지. Lay-Z 지수 숫자는 절대 바꾸지 마세요.',
      'head·desc·summary·recs·rx 전 구간이 같은 「오늘의 한 사람」 이야기여야 합니다.',
      '문장은 짧게 끊기지 말고 공감·구체 묘사·가벼운 유머로 넉넉히 채우세요. 문항에서 고른 보기 텍스트를 desc·summary·recs에 각각 2회 이상 자연스럽게 인용하듯 짚으세요.',
      'rx(수면 가이드)는 recs와 역할 분리: recs=낮·저녁 행동, rx=오늘 밤 잠들기 처방 3개.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
    ].join('\n');

    var profile = buildAnswerProfile(answers, lz, mode, questions);
    var user = [
      'Lay-Z 지수(고정·변경 금지): ' + lz,
      '참고 Mode: ' + (mode ? mode.name + ' / ' + mode.label : ''),
      '',
      profile,
      '',
      '=== 분량·형식 (필수) ===',
      'head: 2문장 이내 한 덩어리, 오늘 포지션을 한 번에 보여주는 헤드라인.',
      'desc: 7~11문장. 공감·오늘 상태 구체 묘사·문항 단서 2회 이상·가벼운 유머.',
      'summary: 4~7문장. desc와 같은 사실을 반복하지 말고, 「오늘 나의 상태 요약」 영역용으로 한 걸음 더 정리한 톤.',
      'tierName·tierTag: Mode를 대체 가능한 짧은 이름·태그(쉼표/·로 구분 가능).',
      'recs: 정확히 3개. 각 desc는 5~9문장(이유·기대·주의·작은 행동).',
      'rx: title, sub(2~4문장), items 정확히 3개. 각 item text는 3~6문장으로 실천을 구체적으로.',
      '',
      '반드시 유효한 JSON 하나만 출력.',
      '{"tierName":"…","tierTag":"…","head":"…","desc":"…","summary":"…","recs":[{"tag":"…","title":"…","desc":"…"},…],"rx":{"title":"…","sub":"…","items":[{"icon":"sleep","text":"…"},…]}}',
      'recs 3개, rx.items 3개. icon 키: sleep, phone-off, bed, light, stretch, alarm, temperature, walk, drink, moon, music, book, mask, breathe, sofa',
    ].join('\n');

    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: [
          { role: 'system', content: layzSystem },
          { role: 'user', content: user },
        ],
        max_tokens: 4800,
        temperature: 0.78,
      }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) return null;
    var raw = typeof data.text === 'string' ? data.text.trim() : '';
    if (!raw && data.raw && data.raw.choices && data.raw.choices[0] && data.raw.choices[0].message) {
      raw = String(data.raw.choices[0].message.content || '').trim();
    }
    var m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch (e) {
      return null;
    }
  }

  function mapToUi(ai, mode, resultCopy, getResultDetails) {
    var fallback = getResultDetails(mode.name);
    var copy = resultCopy[mode.name] || resultCopy.Easy || {};
    if (!ai) {
      return {
        title: copy.title,
        desc: copy.desc,
        tags: copy.tags || [],
        summary: fallback.summary,
        recommends: fallback.recommends,
        rx: null,
        applied: false,
      };
    }
    var recs = Array.isArray(ai.recs) ? ai.recs : [];
    var recommends =
      recs.length >= 3
        ? recs.slice(0, 3).map(function (x) {
            return {
              badge: String(x.tag || '추천').trim(),
              title: String(x.title || '').trim(),
              desc: String(x.desc || '').trim(),
            };
          })
        : fallback.recommends;
    var rx = null;
    if (ai.rx && Array.isArray(ai.rx.items) && ai.rx.items.length >= 3) {
      rx = {
        title: String(ai.rx.title || '편안한 밤을 위한 팁').trim(),
        sub: String(ai.rx.sub || '').trim(),
        items: ai.rx.items.slice(0, 3).map(function (it) {
          if (typeof it === 'string') return { text: it.trim() };
          return { text: String(it.text || it.desc || '').trim() };
        }),
      };
    }
    var descText = String(ai.desc || copy.desc).trim();
    var summaryText = String(ai.summary || ai.desc || fallback.summary).trim();
    return {
      title: String(ai.head || copy.title).trim(),
      desc: descText,
      tags: String(ai.tierTag || '')
        .trim()
        .split(/[,·]/)
        .map(function (t) {
          return t.trim();
        })
        .filter(Boolean)
        .concat(copy.tags || [])
        .slice(0, 4),
      summary: summaryText,
      recommends: recommends,
      rx: rx,
      tierName: String(ai.tierName || mode.label).trim(),
      applied: true,
    };
  }

  window.LayZAi = { fetchCopy: fetchCopy, mapToUi: mapToUi };
})();
