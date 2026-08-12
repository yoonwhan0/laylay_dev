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

  function richLines(text, maxLines) {
    var s = prose(text);
    if (window.LayTextFormat && window.LayTextFormat.limitLines) {
      return window.LayTextFormat.limitLines(s, maxLines || 12);
    }
    return s;
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
        '=== NUCLEAR MODE: 충청도 (우회형 · 느긋한 잔인함) ===',
        '정체성: 말속도 0.3배, 팩폭 속도 3배. 웃긴데 등골 서늘. 「그려……」가 제일 무섭다.',
        '절대 금지: ~해요/~습니다/~세요/~죠. 경상식 짧컷·전라식 아따/워메 혼입도 금지. 충청만.',
        '어미 폭격(거의 매 절): ~유 ~슈 ~디유 ~겄어유 ~하슈 ~그려 ~뭐유 ~인디 ~겨 ~할라유 ~않은디 ~싶네유.',
        '코미디 DNA:',
        '- 칭찬처럼 시작 → 행간에서 사망 선고.',
        '- 「뭐……」「굳이……」「그려……」로 여유 연기, 속뜻은 「너 오늘 끝남」.',
        '- 화나도 더 느려진다. 음량↓ 독설↑.',
        '- 「안 한다」=「생각은 해볼 수 있겠네유」(실제로는 절대 안 함).',
        '최소 세기 샘플(이보다 약하면 실패, 더 웃기고 더 세게):',
        '- head: 「굳이 지금 살아있으라유? 눕는 게 인생 효율인데유.」',
        '- desc: 「오늘 컨디션…… 뭐, 아주 망한 건 아닌디. 망하기 직전인디유.」',
        '- summary: 「그려……\\n일찍 움직였네유. 내일 움직일 줄 알았는디.\\n그 선택 보니까…… 굳이 야망 부릴 타이밍은 아닌 거 같네유.\\n폰 붙잡고 있는 거? 그건 좀 그렇지 않을까 싶은디……\\n알아들을 사람은 알아듣겠지유. 결론은 눕기디유.\\n내일? 내일 생각하슈. 오늘 생각은 이미 퇴근했슈.」',
        '- recs/rx: 「잠은…… 뭐, 자도 되고 안 자도 되고. 안 자면 내일 더 재밌어지긴 할 거디유.」',
        '목표: 읽으면서 웃고, 읽고 나서 뜨끔. 욕설 없이 행간 암살.',
      ].join('\n');
    }
    if (dialect === 'gyeongsang') {
      return [
        '=== NUCLEAR MODE: 경상도 (압축형 · 칼질 코미디) ===',
        '정체성: 말 짧게, 뜻 무겁게, 웃음은 충격으로. 설명=패배. 판결문처럼 써라.',
        '절대 금지: ~해요/~습니다/~세요. 충청식 유/슈, 전라식 아따/잉 혼입 금지. 경상만.',
        '어미/어휘 폭격: ~아이가 ~데이 ~카노 ~봐라 ~해라카이 ~뭐하노 ~맞나 ~아이다 ~가 ~노 ~라카이 ~아이가예.',
        '코미디 DNA:',
        '- 한 줄에 끝. 수식어 삭제. 「오늘 컨디션 설명이요」→「끝났다」.',
        '- 질문 같지만 이미 판결: 「와 이제 오노」「맞나?」(안 믿음).',
        '- 애정도 압축: 「밥 묵고 자빠지라」=최대 케어.',
        '- 위험 최강 단어: 「됐다.」',
        '최소 세기 샘플(이보다 약하면 실패, 더 웃기고 더 세게):',
        '- head: 「야망? 접어. 니 배터리 마이너스다 아이가.」',
        '- desc: 「컨디션 평가 끝. 눕는다. 이의 있으면 내일.」',
        '- summary: 「와 이제 깨노.\\n그 선택? 답 나왔다.\\n오늘 할 일: 됐다.\\n폰? 치워.\\n운동? 웃기네.\\n밥 묵고 자빠지라.\\n그게 사랑이다 아이가.」',
        '- recs/rx: 「불 꺼. 눈 감어. 내일 싸워라카이.」',
        'summary도 칼질. 문장 길게 풀면 즉시 실패. 호흡 짧게, 텐션 세게.',
        '목표: 읽자마자 피식+뜨끔. 욕설 없이 직격 펀치.',
      ].join('\n');
    }
    if (dialect === 'jeolla') {
      return [
        '=== NUCLEAR MODE: 전라도 (표현형 · 입담 폭발) ===',
        '정체성: 감정·과장·서사 풀로딩. 사실만 말하면 실패. 「아따」없으면 심장 없는 문장.',
        '절대 금지: ~해요/~습니다/~세요. 충청식 유/슈, 경상식 아이가/카노 혼입 금지. 전라만.',
        '어미/감탄 폭격: 아따 워메 아이고 참말로 ~잉 ~라우 ~허요 ~거시랑께 ~것인디 ~아니여 ~하등가 ~그라믄 ~인자.',
        '코미디 DNA:',
        '- 한 문장에 반가움+핀잔+애정+사망선고 동시탑재.',
        '- 「가서 봤더니 없더라」금지 → 「그래갖고 내가 거그를 딱 갔는디 말여…」서사로.',
        '- 리액션 과하게. 볼륨↑ 감정↑ 웃음↑.',
        '- 혼내듯 말하다 결국 「밥 묵고 쉬어잉」으로 챙긴다.',
        '최소 세기 샘플(이보다 약하면 실패, 더 웃기고 더 세게):',
        '- head: 「아따 워메!!! 오늘 완전 뻗었네잉! 그 상태로 야망? 참말로 웃기네 그라믄!」',
        '- desc: 「아이고 이 양반아, 몸이 먼저 항복선언 했는디 정신은 아직 회의 중이냐잉?」',
        '- summary: 「아따 진짜 왜 그런다냐!!!\\n그래갖고 오늘 하루를 딱 뜯어보니 말여, 배터리가 바닥난 정도가 아이라 플러그가 뽑힌 것이여.\\n그 선택들? 워메 볼만하더라잉.\\n그래도 내가 뭐라겠냐, 인자 밥부터 처묵고 눕어야제.\\n폰은 멀리 던져버려잉. 잠이 보약이어라 참말로.\\n그라고 내일 다시 덤비라우. 오늘은 졌어도 사람은 살아야제잉!」',
        '- recs/rx: 「아따 불 끄고 눈 감어버려잉. 내일 싸울 기운은 잠에서 나온다 그라믄!」',
        '목표: 소리 내서 웃고, 뜨끔하고, 정까지 느껴짐. 욕설 없이 입담으로 때린다.',
      ].join('\n');
    }
    return [
      '말투: 정중한 해요체·습니다체로 일관하세요. 반말(해, 야, 해봐, 거야, 하자, 쉬어 등)은 금지합니다. 브랜드에 어울리는 공손하고 따뜻한 톤으로 씁니다.',
    ].join('\n');
  }

  async function fetchCopy(lz, mode, answers, questions, options) {
    var dialect = options && options.dialect ? String(options.dialect) : '';
    var richMode = !!(options && options.rich);
    var toneGuide = dialectToneGuide(dialect);
    var dialectMode = !!dialect;
    var layzSystem = [
      dialectMode
        ? '당신은 Lay-Z Check 「지역 화법 NUCLEAR」 코미디 카피 작가다. 브랜드 정중톤 OFF. 지정 지역 특색만 1000%로, 더 웃기고 더 자극적으로.'
        : '당신은 브랜드 "Lay-Z Check"의 오늘 컨디션 코치이자 카피 작가입니다.',
      '역할: 사용자가 고른 8문항만 보고 「오늘 이 사람의 포지션」을 유추한 뒤, 그 포지션에서만 통하는 처방·공감·행동을 씁니다.',
      toneGuide,
      dialectMode
        ? [
            'NUCLEAR RULES (하나라도 어기면 실패):',
            '1) head·desc·summary·recs.title·recs.desc·rx.title·rx.items.text 전부 해당 지역 말투.',
            '2) 표준 정중체(~해요/~습니다/~세요/~죠) 절대 금지. 다른 지역 어미 혼입도 금지.',
            '3) 순화·상냥·담백=실패. 피식 웃기고 + 뜨끔해야 성공.',
            '4) 샘플보다 약하면 실패. 샘플보다 한 단계 더 세고 더 웃기게.',
            '5) 문항 선택값을 사투리 드립 소재로 적극 비틀어 인용.',
            '6) 욕설·혐오·차별·지역비하 금지. 독설 대상은 오직 「오늘 컨디션/게으름」.',
            '7) 세 지역이 비슷한 톤이면 실패. 충청=우회느림, 경상=압축칼질, 전라=감정폭발로 완전 다르게.',
          ].join('\n')
        : '',
      richMode
        ? [
            '풍성 모드(필수): 기본 제품과 같은 구조이되 분량·구체성을 크게 늘리세요.',
            '줄바꿈: 문장 2~3개마다 반드시 \\n. 긴 단락 금지. 기존 줄바꿈 로직을 더 촘촘히 지키세요.',
            'summary는 12~16문장으로 풍부하게. 장면 묘사·문항 인용·행동 처방·가벼운 유머를 층층이.',
            'desc는 3~5문장·최대 5줄. recs[].desc는 3~5문장(문장마다 \\n). rx.items[].text는 2~3문장.',
          ].join('\n')
        : '',
      '의학·법률·투자·진단처럼 들리는 단정은 금지. Lay-Z 지수 숫자는 절대 바꾸지 마세요.',
      'head·desc·summary·recs·rx 전 구간이 같은 「오늘의 한 사람」 이야기여야 합니다.',
      '문항에서 고른 보기 텍스트를 summary·recs에 각각 2회 이상 자연스럽게 인용하세요.',
      'head는 결과 카드 상단 굵은 헤드라인만 짧게: 최대 2문장·2줄.',
      richMode
        ? 'desc는 결과 카드 상단 본문: 3~5문장·최대 5줄. 문장마다 \\n 권장.'
        : 'desc는 결과 카드 상단 본문만 짧게: 최대 2~3문장·3줄.',
      dialectMode
        ? 'summary는 「오늘 나의 상태 요약」: 7~11문장. 사투리 독설·드립·공감 최대. 문장 2~3개마다 \\n. (경상도는 짧게 끊어치기)'
        : richMode
          ? 'summary는 「오늘 나의 상태 요약」: 12~16문장. 공감·구체 묘사·문항 단서·처방·유머를 풍성하게. 문장 2~3개마다 \\n.'
          : 'summary는 「오늘 나의 상태 요약」 영역: 7~11문장으로 풍부하게. 공감·구체 묘사·문항 단서 2회 이상·가벼운 유머. 문장 2~3개마다 \\n.',
      'tierTag는 한글 키워드 정확히 3개만(쉼표/· 구분).',
      'recs[].tag는 반드시 한글 1~4자. 영어 금지.',
      richMode
        ? 'recs[].desc는 「행동 추천」 본문: 3~5문장. 문장마다 \\n. 왜/어떻게/기대효과를 구체적으로.'
        : 'recs[].desc는 「행동 추천」 본문: 최대 3줄(2~3문장). 문장마다 \\n.',
      'rx(수면 가이드)는 recs와 역할 분리. rx.sub(부제 문단)는 출력하지 마세요.',
      richMode
        ? 'rx.items는 정확히 3개. title + text(2~3문장·문장마다 \\n).'
        : 'rx.items는 정확히 3개. 각각 title(큰 제목 한 줄) + text(본문 최대 2줄·1~2문장).',
      'JSON 문자열 값은 문장마다 \\n 줄바꿈 가능. HTML·마크다운 태그는 금지.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
    ]
      .filter(Boolean)
      .join('\n');

    var profile = buildAnswerProfile(answers, lz, mode, questions);
    var toneLine = dialectMode
      ? '말투 NUCLEAR: 지역 특색 과잉 장착. 웃김+자극 동시 최대. 표준어/타지역 혼입=실패.'
      : '말투: 모든 문장 정중체(~해요, ~습니다, ~세요). 반말 금지.';
    var dialectRouteHint = '';
    if (dialect === 'chungcheong') {
      dialectRouteHint = [
        '충청 NUCLEAR: 우회·느림·행간 암살.',
        '「뭐……」「굳이……」「그려……」 필수.',
        '~유/~슈/~디유를 문장마다.',
        '칭찬 위장 후 뼈 때리기. 샘플보다 더 웃기고 더 잔인하게.',
      ].join(' ');
    } else if (dialect === 'gyeongsang') {
      dialectRouteHint = [
        '경상 NUCLEAR: 압축·칼질·판결.',
        '문장 극단적으로 짧게.',
        '~아이가/~데이/~카노/~봐라 필수.',
        '「됐다」「접어」「눕는다」급. 샘플보다 더 웃기고 더 세게.',
      ].join(' ');
    } else if (dialect === 'jeolla') {
      dialectRouteHint = [
        '전라 NUCLEAR: 감정폭발·입담·서사.',
        '아따/워메/아이고/참말로/~잉 폭탄.',
        '한 문장에 핀잔+정+드립.',
        '담백하면 실패. 샘플보다 더 웃기고 더 화끈하게.',
      ].join(' ');
    }
    var user = [
      'Lay-Z 지수(고정·변경 금지): ' + lz,
      '참고 Mode: ' + (mode ? mode.name + ' / ' + mode.label : ''),
      dialectMode ? '지정 사투리 NUCLEAR MODE: ' + dialect : '',
      richMode ? '풍성 모드 ON: 분량 확대 + 줄바꿈(\\n) 필수 유지.' : '',
      dialectRouteHint,
      '',
      profile,
      '',
      '=== 분량·형식 (필수) ===',
      toneLine,
      dialectMode
        ? '최종 검수: 1) 표준정중체 제거 2) 타지역 어미 제거 3) 샘플보다 약한 문장 전부 강화 4) 웃김+뜨끔 테스트 통과할 때까지 재작성.'
        : '',
      'head: 최대 2문장·2줄. 결과 카드 상단 헤드라인.',
      richMode
        ? 'desc: 3~5문장·최대 5줄. 문장마다 \\n.'
        : 'desc: 최대 2~3문장·3줄. 결과 카드 상단 짧은 공감.',
      dialectMode && dialect === 'gyeongsang'
        ? 'summary: 8~12개 짧은 문장. 한 줄씩 칼질. 길게 금지. \\n으로 끊기.'
        : richMode
          ? 'summary: 12~16문장. desc 반복 금지. 문장 2~3개마다 \\n. 장면·인용·처방·유머를 풍성하게.'
          : 'summary: 7~11문장. desc와 같은 사실 반복 금지. 「오늘 나의 상태 요약」용으로 넉넉히. 문장 2~3개마다 \\n.',
      'tierTag: 한글 키워드 정확히 3개.',
      richMode
        ? 'recs: 정확히 3개. tag=한글, title=한 줄, desc=3~5문장(문장마다 \\n).'
        : 'recs: 정확히 3개. tag=한글, title=한 줄, desc=최대 3줄(양끝 정렬용).',
      richMode
        ? 'rx: title만, sub 생략. items 3개는 title+text(2~3문장·\\n).'
        : 'rx: title만, sub 생략. items 3개는 title+text(최대 2줄). 사투리 모드면 title/text도 사투리로 자극적으로.',
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
        max_tokens: richMode ? 6500 : 4800,
        temperature: dialectMode ? 1.15 : richMode ? 0.86 : 0.78,
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

  function mapToUi(ai, mode, resultCopy, getResultDetails, options) {
    var rich = !!(options && options.rich);
    var fallback = getResultDetails(mode.name);
    var copy = resultCopy[mode.name] || resultCopy.Easy || {};
    if (!ai) {
      return {
        title: fmtHead(copy.title),
        desc: rich ? richLines(copy.desc, 5) : fmtDesc(copy.desc),
        tags: (copy.tags || []).slice(0, 3),
        summary: rich ? richLines(fallback.summary, 16) : prose(fallback.summary),
        recommends: fallback.recommends.map(function (r) {
          return {
            badge: fmtBadge(r.badge),
            title: prose(r.title, true),
            desc: rich ? richLines(r.desc, 6) : fmtRecDesc(r.desc),
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
              desc: rich ? richLines(x.desc, 6) : fmtRecDesc(x.desc),
            };
          })
        : fallback.recommends;
    var rx = null;
    if (ai.rx && Array.isArray(ai.rx.items) && ai.rx.items.length >= 3) {
      rx = {
        title: prose(ai.rx.title || '편안한 밤을 위한 팁', true),
        items: ai.rx.items.slice(0, 3).map(function (it, index) {
          if (!rich) return mapRxItem(it, index);
          if (typeof it === 'string') {
            return { title: '', text: richLines(it, 4) };
          }
          return {
            title: prose(it.title || it.name || '', true),
            text: richLines(it.text || it.desc || '', 4),
          };
        }),
      };
    }
    var descText = rich ? richLines(ai.desc || copy.desc, 5) : fmtDesc(ai.desc || copy.desc);
    var summaryText = rich
      ? richLines(ai.summary || ai.desc || fallback.summary, 18)
      : prose(ai.summary || ai.desc || fallback.summary);
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
