'use strict';

(function () {
  function prose(text, singleLine) {
    if (window.LayTextFormat) {
      return window.LayTextFormat.formatProse(text, singleLine ? { singleLine: true } : undefined);
    }
    return String(text || '').trim();
  }

  function fmtHead(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatResultHead(text) : prose(text, true);
  }

  function fmtDesc(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatResultDesc(text) : prose(text);
  }

  function fmtRecDesc(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatRecommendDesc(text) : prose(text);
  }

  function fmtSleepText(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatSleepItemText(text) : prose(text);
  }

  function fmtBadge(tag) {
    return window.LayTextFormat ? window.LayTextFormat.toKoreanBadge(tag) : String(tag || '추천');
  }

  var RX_FALLBACK_TITLES = ['정해진 시간에 잠자기', '스마트폰 멀리하기', '편안한 수면 환경 만들기'];

  function mapRxItem(it, index) {
    if (typeof it === 'string') {
      return { title: RX_FALLBACK_TITLES[index] || '', text: fmtSleepText(it) };
    }
    var title = prose(it.title || it.name || RX_FALLBACK_TITLES[index] || '', true);
    var text = fmtSleepText(it.text || it.desc || '');
    return { title: title, text: text };
  }

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

  function dialectToneGuide(dialect) {
    if (dialect === 'chungcheong') {
      return [
        '=== HARD MODE: 충청도 화법 (우회형 독설) ===',
        '실패 조건: ~해요/~습니다/~세요/~죠 같은 표준 정중체가 한 문장이라도 나오면 실패.',
        '핵심: 「말보다 뜻이 길다」. 결론은 이미 끝났고, 행간으로 뼈를 친다. 느긋한데 더 잔인하다.',
        '어미 강제(매 문장 최소 1개): ~유 ~슈 ~디유 ~겄어유 ~하슈 ~그려 ~뭐유 ~인디 ~겨 ~할라유.',
        '공격: 우회형. 「싫다」를 「그건 좀 그렇지 않을까 싶은디…」로. 화나도 더 차분해진다.',
        '자극 목표: 웃긴데 뜨끔. 위로하는 척하다가 한 방. 브랜드 순화·상냥함 금지.',
        '스타일 레퍼런스(이런 세기로 쓸 것):',
        '- head: 「굳이 지금 일어나라유? 내일도 누워있을 거면서유.」',
        '- desc: 「오늘 컨디션… 뭐, 아주 죽은 건 아닌디. 산 것도 아니디유.」',
        '- summary: 「그려…… 지금 야망 있으면 좀 그렇지 않을까 싶은디.\\n일찍 일어났네유. 내일 일어날 줄 알았는디.\\n굳이 그렇게까지 해야 하나 싶은디…… 눕는 게 제일 빠른 길이디유.」',
        '- recs: 「폰은 멀리…… 라고는 하는데, 그거 가능하겄어유?」',
        '금지: 욕설·혐오·차별. 대신 우회 팩폭·건조한 독설로 자극도 최대.',
      ].join('\n');
    }
    if (dialect === 'gyeongsang') {
      return [
        '=== HARD MODE: 경상도 화법 (압축형 독설) ===',
        '실패 조건: 긴 설명문·표준 정중체(~해요/~습니다)가 나오면 실패. 문장이 길어지면 실패.',
        '핵심: 「뜻보다 말이 짧다」. 설명 없이 판결. 들은 순간 뜨끔하게.',
        '어미 강제(매 문장 최소 1개): ~아이가 ~데이 ~카노 ~봐라 ~해라카이 ~뭐하노 ~맞나 ~아이다 ~가 ~노.',
        '공격: 압축형. 「와 이제 오노.」「그거 오늘 해라.」「됐다.」급으로 잘라라.',
        '자극 목표: 군더더기 제로. 한 줄에 컷. 돌려 말하기·완곡어법 절대 금지.',
        '스타일 레퍼런스(이런 세기로 쓸 것):',
        '- head: 「야망은 접어라카이. 니 지금 방전이다 아이가.」',
        '- desc: 「오늘 컨디션? 끝났다. 눕는다.」',
        '- summary: 「와 이제 깨노.\\n그 선택 보면 답 나왔다 아이가.\\n오늘 할 일? 됐다.\\n밥 묵고 자빠지라. 그게 답이다.」',
        '- recs: 「폰 치워라. 잠 자라. 내일 해라.」',
        'summary도 짧게 끊어라. 길게 풀면 경상도 실패. 문장당 짧게, 칼질하듯.',
        '금지: 욕설·혐오·차별. 대신 직설·압축·텐션으로 자극도 최대.',
      ].join('\n');
    }
    if (dialect === 'jeolla') {
      return [
        '=== HARD MODE: 전라도 화법 (표현형 독설) ===',
        '실패 조건: 담백한 표준어·정중체(~해요/~습니다)가 나오면 실패. 감정 없는 문장도 실패.',
        '핵심: 「말에 감정이 실린다」. 반가움+핀잔+애정이 한 문장에 동시 탑재.',
        '어미/감탄 강제: ~잉 ~라우 ~허요 ~거시랑께 ~하등가 ~워메 ~참말로 ~아따 ~것인디 ~아니여. 문장마다 감정 단어 넣기.',
        '공격: 표현형. 「아따 그것을 그냥 놔두면 쓰겄냐?」급. 리액션 크게, 서사로 키운다.',
        '자극 목표: 입담 화끈. 혼내듯 말하면서 정은 있다. 사실만 말하면 실패, 감정이 넘쳐야 성공.',
        '스타일 레퍼런스(이런 세기로 쓸 것):',
        '- head: 「아따 워메, 오늘 완전 뻗었네잉! 그라믄 눕는 게 답이제 참말로.」',
        '- desc: 「아이고 이 사람아, 그 상태로 뭐 하겠다고 허요? 정신 차려봐잉.」',
        '- summary: 「아따 진짜 왜 그런다냐!\\n그래갖고 오늘 하루를 딱 봤는데 말여, 몸이 먼저 항복한 것이여.\\n그래도 내가 뭐라겠냐, 일단 밥 먹고 푹 쉬어야제잉.\\n그라고 내일 다시 덤비라우.」',
        '- recs: 「아따 폰은 멀리 던져버려잉. 잠이 보약이어라.」',
        '금지: 욕설·혐오·차별. 대신 과장·입담·정 섞인 독설로 자극도 최대.',
      ].join('\n');
    }
    return [
      '말투: 정중한 해요체·습니다체로 일관하세요. 반말(해, 야, 해봐, 거야, 하자, 쉬어 등)은 금지합니다. 브랜드에 어울리는 공손하고 따뜻한 톤으로 씁니다.',
    ].join('\n');
  }

  async function fetchCopy(lz, mode, answers, questions, options) {
    var dialect = options && options.dialect ? String(options.dialect) : '';
    var toneGuide = dialectToneGuide(dialect);
    var dialectMode = !!dialect;
    var layzSystem = [
      dialectMode
        ? '당신은 Lay-Z Check의 「지역 화법 하드모드」 카피 작가다. 정중한 브랜드톤은 꺼라. 지정 지역 화법으로만, 최대한 자극적으로 써라.'
        : '당신은 브랜드 "Lay-Z Check"의 오늘 컨디션 코치이자 카피 작가입니다.',
      '역할: 사용자가 고른 8문항만 보고 「오늘 이 사람의 포지션」을 유추한 뒤, 그 포지션에서만 통하는 처방·공감·행동을 씁니다.',
      toneGuide,
      dialectMode
        ? [
            '사투리 HARD RULES (위반 시 출력 실패로 간주):',
            '1) head·desc·summary·recs.title·recs.desc·rx.title·rx.items.text 전부 해당 지역 말투.',
            '2) 표준어 정중체(~해요/~습니다/~세요/~죠) 한 문장이라도 쓰면 실패. 중간에 표준어로 회귀 금지.',
            '3) 부드럽게 순화하지 말 것. 웃기면서 뜨끔하게. 자극도 최우선.',
            '4) 위 스타일 레퍼런스 세기 이상으로 쓸 것. 레퍼런스보다 약하면 실패.',
            '5) 욕설·혐오·차별·지역비하 금지. 독설은 상대 컨디션을 향한 유머로만.',
          ].join('\n')
        : '',
      '의학·법률·투자·진단처럼 들리는 단정은 금지. Lay-Z 지수 숫자는 절대 바꾸지 마세요.',
      'head·desc·summary·recs·rx 전 구간이 같은 「오늘의 한 사람」 이야기여야 합니다.',
      '문항에서 고른 보기 텍스트를 summary·recs에 각각 2회 이상 자연스럽게 인용하세요.',
      'head는 결과 카드 상단 굵은 헤드라인만 짧게: 최대 2문장·2줄.',
      'desc는 결과 카드 상단 본문만 짧게: 최대 2~3문장·3줄.',
      dialectMode
        ? 'summary는 「오늘 나의 상태 요약」: 7~11문장. 사투리 독설·드립·공감 최대. 문장 2~3개마다 \\n. (경상도는 짧게 끊어치기)'
        : 'summary는 「오늘 나의 상태 요약」 영역: 7~11문장으로 풍부하게. 공감·구체 묘사·문항 단서 2회 이상·가벼운 유머. 문장 2~3개마다 \\n.',
      'tierTag는 한글 키워드 정확히 3개만(쉼표/· 구분).',
      'recs[].tag는 반드시 한글 1~4자. 영어 금지.',
      'recs[].desc는 「행동 추천」 본문: 최대 3줄(2~3문장). 문장마다 \\n.',
      'rx(수면 가이드)는 recs와 역할 분리. rx.sub(부제 문단)는 출력하지 마세요.',
      'rx.items는 정확히 3개. 각각 title(큰 제목 한 줄) + text(본문 최대 2줄·1~2문장).',
      'JSON 문자열 값은 문장마다 \\n 줄바꿈 가능. HTML·마크다운 태그는 금지.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
    ]
      .filter(Boolean)
      .join('\n');

    var profile = buildAnswerProfile(answers, lz, mode, questions);
    var toneLine = dialectMode
      ? '말투 HARD: 지정 지역 화법 100%. 표준어 회귀=실패. 자극도 최우선. head~rx까지 전부.'
      : '말투: 모든 문장 정중체(~해요, ~습니다, ~세요). 반말 금지.';
    var dialectRouteHint = '';
    if (dialect === 'chungcheong') {
      dialectRouteHint = [
        '경로: 우회형 HARD.',
        '반드시 ~유/~슈/~디유/~그려 를 빈번히 사용.',
        '예시를 따라 여유롭게 뼈 때릴 것. 「굳이…」「뭐…」「그려……」 패턴 적극 사용.',
        '정중 브랜드톤으로 바꾸면 실패.',
      ].join(' ');
    } else if (dialect === 'gyeongsang') {
      dialectRouteHint = [
        '경로: 압축형 HARD.',
        '문장 짧게. ~아이가/~데이/~카노/~봐라 필수.',
        '길게 설명하지 말고 판결하듯. 「됐다」「접어라」「눕는다」급으로.',
        '정중 브랜드톤으로 바꾸면 실패.',
      ].join(' ');
    } else if (dialect === 'jeolla') {
      dialectRouteHint = [
        '경로: 표현형 HARD.',
        '아따/워메/잉/참말로 를 적극 사용. 감정·핀잔·정을 한 문장에.',
        '담백하게 쓰면 실패. 입담 세게, 서사 있게.',
        '정중 브랜드톤으로 바꾸면 실패.',
      ].join(' ');
    }
    var user = [
      'Lay-Z 지수(고정·변경 금지): ' + lz,
      '참고 Mode: ' + (mode ? mode.name + ' / ' + mode.label : ''),
      dialectMode ? '지정 사투리 HARD MODE: ' + dialect : '',
      dialectRouteHint,
      '',
      profile,
      '',
      '=== 분량·형식 (필수) ===',
      toneLine,
      dialectMode
        ? '최종 검수: 출력 전에 표준 정중체 문장이 없는지 확인하고, 있으면 전부 해당 사투리로 다시 써라. 레퍼런스보다 약하면 더 세게 올려라.'
        : '',
      'head: 최대 2문장·2줄. 결과 카드 상단 헤드라인.',
      'desc: 최대 2~3문장·3줄. 결과 카드 상단 짧은 공감.',
      'summary: 7~11문장. desc와 같은 사실 반복 금지. 「오늘 나의 상태 요약」용으로 넉넉히. 문장 2~3개마다 \\n.',
      'tierTag: 한글 키워드 정확히 3개.',
      'recs: 정확히 3개. tag=한글, title=한 줄, desc=최대 3줄(양끝 정렬용).',
      'rx: title만(예: 편안한 밤을 위한 팁), sub 생략. items 3개는 title+text(최대 2줄). 사투리 모드면 title/text도 사투리.',
      '',
      '반드시 유효한 JSON 하나만 출력.',
      '{"tierName":"…","tierTag":"키워드1,키워드2,키워드3","head":"…","desc":"…","summary":"…","recs":[{"tag":"휴식","title":"…","desc":"…"},…],"rx":{"title":"편안한 밤을 위한 팁","items":[{"title":"정해진 시간에 잠자기","text":"…"},…]}}',
    ]
      .filter(Boolean)
      .join('\n');

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
        temperature: dialectMode ? 1.05 : 0.78,
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
        title: fmtHead(copy.title),
        desc: fmtDesc(copy.desc),
        tags: (copy.tags || []).slice(0, 3),
        summary: prose(fallback.summary),
        recommends: fallback.recommends.map(function (r) {
          return {
            badge: fmtBadge(r.badge),
            title: prose(r.title, true),
            desc: fmtRecDesc(r.desc),
          };
        }),
        rx: null,
        applied: false,
      };
    }
    var recs = Array.isArray(ai.recs) ? ai.recs : [];
    var recommends =
      recs.length >= 3
        ? recs.slice(0, 3).map(function (x) {
            return {
              badge: fmtBadge(x.tag || '추천'),
              title: prose(x.title, true),
              desc: fmtRecDesc(x.desc),
            };
          })
        : fallback.recommends;
    var rx = null;
    if (ai.rx && Array.isArray(ai.rx.items) && ai.rx.items.length >= 3) {
      rx = {
        title: prose(ai.rx.title || '편안한 밤을 위한 팁', true),
        items: ai.rx.items.slice(0, 3).map(mapRxItem),
      };
    }
    var descText = fmtDesc(ai.desc || copy.desc);
    var summaryText = prose(ai.summary || ai.desc || fallback.summary);
    return {
      title: fmtHead(ai.head || copy.title),
      desc: descText,
      tags: String(ai.tierTag || '')
        .trim()
        .split(/[,·]/)
        .map(function (t) {
          return t.trim();
        })
        .filter(Boolean)
        .concat(copy.tags || [])
        .slice(0, 3),
      summary: summaryText,
      recommends: recommends,
      rx: rx,
      tierName: String(ai.tierName || mode.label).trim(),
      applied: true,
    };
  }

  window.LayZAi = { fetchCopy: fetchCopy, mapToUi: mapToUi };
})();
