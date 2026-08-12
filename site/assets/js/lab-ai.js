'use strict';

/**
 * Module 05 — LAB OVERDRIVE AI
 * 토큰 폭주 + ADHD 머릿속 덤프 (병렬 5호출)
 */
(function () {
  function prose(text, singleLine) {
    if (window.LayTextFormat) {
      return window.LayTextFormat.formatProse(text, singleLine ? { singleLine: true } : undefined);
    }
    return String(text || '').trim();
  }

  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  async function chat(messages, opts) {
    var o = opts || {};
    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: messages,
        max_tokens: o.max_tokens || 12000,
        temperature: typeof o.temperature === 'number' ? o.temperature : 1.1,
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

  function profileBlock(answers, questions, metrics, mode) {
    var lines = (answers || []).map(function (a, i) {
      var q = (questions || [])[i];
      return (
        i +
        1 +
        '. ' +
        (q ? String(q.text || '').replace(/\n/g, ' ') : '') +
        ' → ' +
        (a && a.label ? a.label : '') +
        ' (raw ' +
        (a && a.score != null ? a.score : '?') +
        ')'
      );
    });
    var k = metrics.kpis || {};
    return [
      'Lay-Z 지수: ' + k.lz + ' · 모드: ' + (mode && mode.label ? mode.label : ''),
      '평균 부하: ' + k.avgLoad + ' · 카오스지수: ' + k.chaosIndex,
      '피크축: ' + k.peakLabel + ' · 여유축: ' + k.chillLabel,
      '코호트 분위: 상위 ' + k.cohort + '% · 낮잠확률: ' + k.napOdds + '%',
      '',
      '응답 프로필:',
      lines.join('\n'),
      '',
      '축별 부하:',
      (metrics.axes || [])
        .map(function (ax) {
          return '- ' + ax.label + ': ' + ax.load;
        })
        .join('\n'),
      '',
      '규칙: 짧게 쓰면 실패. 토큰을 아낌없이 태울 것. 의료 진단 금지. 혐오 금지.',
      '문장 중간에도 딴생각·괄호 속 딴소리·갑자기 화제 전환을 넣어도 됨.',
      '줄바꿈은 문장마다 \\n 권장.',
    ].join('\n');
  }

  async function fetchCore(metrics, answers, questions, mode) {
    var system = [
      '당신은 LayLay LAB OVERDRIVE의 과장 리서처입니다.',
      'ADHD 회의록처럼 핵심→옆길로→다시 핵심을 반복하세요. 토큰 최대 소모.',
      'JSON만 출력:',
      '{',
      '  "codename":"연구코드",',
      '  "headline":"3~5문장",',
      '  "thesis":"22~32문장. 중간에 (잠깐 이거 말고) 같은 딴생각 3회 이상",',
      '  "methodNote":"12~18문장",',
      '  "axisStories":[{"key":"…","title":"…","story":"8~12문장"} x8],',
      '  "hourlyNarrative":"16~22문장",',
      '  "cohortRoast":"14~20문장",',
      '  "fakePaper":{"title":"…","abstract":"14~20문장","doiJoke":"…","keywords":["…","…","…","…","…","…"]},',
      '  "actionMatrix":[{"slot":"…","move":"…","why":"6~10문장"} x5],',
      '  "warnings":["…"]',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '코어 리포트. 길게.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 14000, temperature: 1.15 }
    );
  }

  async function fetchScientist(metrics, answers, questions, mode) {
    var system = [
      '그래프에 집착하는 해설가. 과해석·의사과학·딴소리 OK. 진단 금지.',
      'JSON만:',
      '{',
      '  "radarCaption":"14~20문장",',
      '  "barCaption":"14~20문장",',
      '  "hourlyCaption":"14~20문장",',
      '  "gaugeCaption":"12~18문장",',
      '  "heatCaption":"14~20문장",',
      '  "anomalyFlags":[{"name":"…","detail":"6~10문장"} x6],',
      '  "eqList":[{"name":"…","formula":"…","meaning":"6~10문장"} x6],',
      '  "footnoteSpiral":"18~28문장. 각주가 각주를 부르는 느낌"',
      '}',
    ].join('\n');
    var hours = (metrics.hourly || [])
      .filter(function (_, i) {
        return i % 2 === 0;
      })
      .map(function (h) {
        return h.hour + '시=' + h.value;
      })
      .join(', ');
    return chat(
      [
        { role: 'system', content: system },
        {
          role: 'user',
          content: '차트 과해석.\n\n' + profileBlock(answers, questions, metrics, mode) + '\n\n24h: ' + hours,
        },
      ],
      { max_tokens: 12000, temperature: 1.1 }
    );
  }

  async function fetchChaos(metrics, answers, questions, mode) {
    var system = [
      '평행우주·보스전·플레이리스트 작가. 토큰 태우기. 진단 금지.',
      'JSON만:',
      '{',
      '  "timelines":[{"title":"…","odds":12,"story":"12~18문장"} x6],',
      '  "bossBattle":{"enemy":"…","hp":100,"strategy":"16~24문장","loot":["…","…","…","…"]},',
      '  "playlistMood":{"title":"…","tracks":["…"] x10,"why":"12~18문장"},',
      '  "closingMicDrop":"18~28문장",',
      '  "glitchAside":"10~16문장. 갑자기 끊기는 독백"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '카오스 최대치.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 12000, temperature: 1.2 }
    );
  }

  async function fetchAdhd(metrics, answers, questions, mode) {
    var system = [
      '당신은 사용자의 머릿속 ADHD 탭매니저입니다.',
      '이해 안 되게 펼쳐놓되, 응답 데이터와 연결은 유지. 진단·병명 단정 금지. 공감·유머.',
      '토큰을 미친 듯이 쓰세요. JSON만:',
      '{',
      '  "openTabs":[{"title":"브라우저 탭처럼 짧은 제목","body":"8~14문장","urgency":1~5} x12],',
      '  "stickyNotes":[{"color":"yellow|pink|blue|green","text":"4~8문장","tilt":-8~8} x10],',
      '  "intrusiveThoughts":["2~4문장"] x16,',
      '  "unfinishedDrafts":[{"start":"…","derail":"6~10문장","abandonedAt":"…"} x6],',
      '  "rabbitHoles":[{"hook":"…","depth":"12~18문장","exitFail":"3~5문장"} x5],',
      '  "notifications":[{"app":"…","push":"1~2문장","read":false} x14],',
      '  "hyperfocus":{"topic":"…","spiral":"16~24문장"},',
      '  "workingMemoryLeak":"14~20문장. 방금 뭘 하려했는지 까먹는 독백"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        {
          role: 'user',
          content:
            '이 사람 오늘 응답을 ADHD 머릿속 보드로 펼쳐라. 짧게 쓰면 실패.\n\n' +
            profileBlock(answers, questions, metrics, mode),
        },
      ],
      { max_tokens: 15000, temperature: 1.25 }
    );
  }

  async function fetchStream(metrics, answers, questions, mode) {
    var system = [
      '의식의 흐름 작가. 마침표보다 쉼표·괄호·갑자기 새 문단. 토큰 태움. 진단 금지.',
      'JSON만:',
      '{',
      '  "brainDump":"40~60문장. 한 덩어리 의식의 흐름. \\n으로 자주 끊기",',
      '  "waitWhat":["지금 뭐 말하려했지 계열 3~6문장"] x8,',
      '  "parallelVoices":[{"name":"논리","line":"6~10문장"},{"name":"충동","line":"6~10문장"},{"name":"이불","line":"6~10문장"},{"name":"할일","line":"6~10문장"},{"name":"유튜브","line":"6~10문장"}],',
      '  "todoThatWillNeverHappen":[{"item":"…","excuse":"4~7문장"} x10],',
      '  "finalScatter":"20~30문장. 엔딩인데 엔딩 같지 않은 산만함"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '의식의 흐름 풀가동.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 14000, temperature: 1.3 }
    );
  }

  async function runLabBundle(metrics, answers, questions, mode) {
    var started = Date.now();
    var results = await Promise.all([
      fetchCore(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchScientist(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchChaos(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchAdhd(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchStream(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
    ]);
    var est = (metrics.kpis && metrics.kpis.tokenDrama) || 0;
    return {
      core: results[0],
      scientist: results[1],
      chaos: results[2],
      adhd: results[3],
      stream: results[4],
      meta: {
        calls: 5,
        elapsedMs: Date.now() - started,
        estimatedTokens: Math.max(est, 42000),
      },
    };
  }

  function fallbackBundle(metrics, mode) {
    var k = metrics.kpis || {};
    var i;
    var tabs = [];
    for (i = 0; i < 8; i++) {
      tabs.push({
        title: '탭 ' + (i + 1) + ': 이거 나중에',
        body: '점수 ' + k.lz + ' 보면서 딴생각 중.\\n근데 원래 뭐 하려했지.',
        urgency: (i % 5) + 1,
      });
    }
    var stickies = ['물 마시기', '알람 다시', '아 맞다 메일', '누우면 끝', '차트 예쁘다', '집중…안됨'].map(
      function (t, idx) {
        return {
          color: ['yellow', 'pink', 'blue', 'green'][idx % 4],
          text: t + '\\n(' + k.peakLabel + ' 축이 신경 쓰임)',
          tilt: -6 + idx * 2,
        };
      }
    );
    return {
      core: {
        codename: 'ADHD-' + String(k.lz || 0).padStart(2, '0'),
        headline: '머릿속 탭이 너무 많아서, 결과도 그렇게 펼쳤습니다.',
        thesis:
          '오늘 Lay-Z ' +
          k.lz +
          '점.\\n피크는 ' +
          k.peakLabel +
          '.\\n(잠깐 냉장고 생각)\\n다시: 이 리포트는 일부러 산만합니다.\\n의료 진단이 아닙니다.',
        methodNote: '로컬 그래프 + AI 5병렬.\\n짧게 쓰면 실패하는 버전.',
        axisStories: (metrics.radar || []).map(function (a) {
          return { key: a.key, title: a.label, story: a.label + ' 부하 ' + a.load + '.\\n옆에 딴생각 탭 열림.' };
        }),
        hourlyNarrative: '24시간이 한 줄로 안 정리됨.\\n그게 포인트.',
        cohortRoast: '상위 ' + k.cohort + '% 느낌의 가상 동료와 같이 산만함.',
        fakePaper: {
          title: 'Scattered Attention as a Feature, Not a Bug',
          abstract: '가짜 초록.\\n실제 논문 아님.',
          doiJoke: '10.0000/adhd.laylay',
          keywords: ['tabs', 'sofa', 'later', 'wait', 'focus?', 'nap'],
        },
        actionMatrix: [
          { slot: '지금', move: '물 한 모금', why: '탭 하나 닫는 느낌.' },
          { slot: '5분 뒤', move: '창 하나만', why: '나머지는 나중에… 진짜로.' },
          { slot: '저녁', move: '할 일 1개', why: '1개가 영웅.' },
        ],
        warnings: ['재미용', '진단 아님', '산만함 의도적'],
      },
      scientist: {
        radarCaption: '레이더가 뾰족하면 그 축이 오늘 주인공.',
        barCaption: '막대 길수록 “여기 힘듦”.',
        hourlyCaption: '24h는 분위기 곡선.',
        gaugeCaption: '게이지는 과장된 요약.',
        heatCaption: '히트맵은 엔터테인먼트.',
        anomalyFlags: [{ name: '탭 과다', detail: '열린 생각 탭이 많음.' }],
        eqList: [{ name: 'Scatter Index', formula: 'SI=AvgLoad*0.6+Chaos*0.4', meaning: '산만 합성.' }],
        footnoteSpiral: '각주1) 각주2를 보라.\\n각주2) 각주1을 보라.',
      },
      chaos: {
        timelines: [
          { title: '탭 42개 우주', odds: 55, story: '닫으려다 새 탭.' },
          { title: '이불 엔딩', odds: 40, story: '중력 승.' },
        ],
        bossBattle: { enemy: '미완료 탭 군집체', hp: 999, strategy: '전부 닫지 말고 하나만요.', loot: ['물', '햇빛'] },
        playlistMood: {
          title: 'Focus? Maybe.',
          tracks: ['Tab Switch', 'Oh Wait', 'Sofa Bass', 'Later™'],
          why: '산만 OST.',
        },
        closingMicDrop: '정리는 내일의 나에게.\\n오늘은 펼쳐두기.',
        glitchAside: '잠— 아니 결과— 아니 잠깐.',
      },
      adhd: {
        openTabs: tabs,
        stickyNotes: stickies,
        intrusiveThoughts: [
          '아 맞다.',
          '근데 점수보다 배고픈데.',
          '이 문장 쓰다 말았—',
          '유튜브 한 영상만…',
        ],
        unfinishedDrafts: [
          { start: '오늘 할 일은', derail: '일단 누우면…', abandonedAt: '세 번째 문장' },
        ],
        rabbitHoles: [{ hook: '왜 피곤하지?', depth: '수면…아니 카페인…아니 이불.', exitFail: '출구 없음' }],
        notifications: [
          { app: 'Brain', push: '새 생각 도착', read: false },
          { app: 'Sofa', push: '지금이 타이밍', read: false },
        ],
        hyperfocus: { topic: '아무 관련 없는 위키', spiral: '빠졌다가 점수 생각남.' },
        workingMemoryLeak: '방금 뭐 클릭하려했지.\\n아 결과 보는 중이었지.',
      },
      stream: {
        brainDump: '점수 보고…탭 열고…물…차트…아 맞다.\\n다시 점수.',
        waitWhat: ['지금 뭐 말하려했지', '그래프였나 이불이었나'],
        parallelVoices: [
          { name: '논리', line: '데이터 보자.' },
          { name: '충동', line: '눕자.' },
          { name: '할일', line: '나중에.' },
        ],
        todoThatWillNeverHappen: [{ item: '정리하기', excuse: '지금은 산만이 컨셉.' }],
        finalScatter: '엔딩인데 엔딩 아님.\\n탭은 열려 있음.',
      },
      meta: {
        calls: 0,
        elapsedMs: 0,
        estimatedTokens: k.tokenDrama || 0,
        fallback: true,
      },
    };
  }

  function mapList(list, mapFn, fallback) {
    if (!Array.isArray(list) || !list.length) return fallback;
    return list.map(mapFn);
  }

  function mapToUi(bundle, metrics, mode) {
    var base = fallbackBundle(metrics, mode);
    var b = bundle || {};
    var core = b.core || base.core;
    var scientist = b.scientist || base.scientist;
    var chaos = b.chaos || base.chaos;
    var adhd = b.adhd || base.adhd;
    var stream = b.stream || base.stream;
    var meta = Object.assign({}, base.meta, b.meta || {});

    function storyList(list, fallback) {
      return mapList(
        list,
        function (item) {
          return {
            key: item.key || '',
            title: prose(item.title || item.name || '', true),
            story: prose(item.story || item.detail || item.why || ''),
          };
        },
        fallback
      );
    }

    return {
      metrics: metrics,
      meta: meta,
      codename: prose(core.codename || base.core.codename, true),
      headline: prose(core.headline || base.core.headline),
      thesis: prose(core.thesis || base.core.thesis),
      methodNote: prose(core.methodNote || base.core.methodNote),
      axisStories: storyList(core.axisStories, base.core.axisStories),
      hourlyNarrative: prose(core.hourlyNarrative || base.core.hourlyNarrative),
      cohortRoast: prose(core.cohortRoast || base.core.cohortRoast),
      fakePaper: {
        title: prose((core.fakePaper && core.fakePaper.title) || base.core.fakePaper.title, true),
        abstract: prose((core.fakePaper && core.fakePaper.abstract) || base.core.fakePaper.abstract),
        doiJoke: prose((core.fakePaper && core.fakePaper.doiJoke) || base.core.fakePaper.doiJoke, true),
        keywords: ((core.fakePaper && core.fakePaper.keywords) || base.core.fakePaper.keywords || []).map(function (x) {
          return prose(x, true);
        }),
      },
      actionMatrix: mapList(
        core.actionMatrix,
        function (a) {
          return { slot: prose(a.slot, true), move: prose(a.move, true), why: prose(a.why) };
        },
        base.core.actionMatrix
      ),
      warnings: (core.warnings || base.core.warnings || []).map(function (w) {
        return prose(w, true);
      }),
      captions: {
        radar: prose(scientist.radarCaption || base.scientist.radarCaption),
        bar: prose(scientist.barCaption || base.scientist.barCaption),
        hourly: prose(scientist.hourlyCaption || base.scientist.hourlyCaption),
        gauge: prose(scientist.gaugeCaption || base.scientist.gaugeCaption),
        heat: prose(scientist.heatCaption || base.scientist.heatCaption),
      },
      anomalyFlags: storyList(scientist.anomalyFlags, base.scientist.anomalyFlags),
      eqList: mapList(
        scientist.eqList,
        function (e) {
          return {
            name: prose(e.name, true),
            formula: prose(e.formula, true),
            meaning: prose(e.meaning),
          };
        },
        base.scientist.eqList
      ),
      footnoteSpiral: prose(scientist.footnoteSpiral || base.scientist.footnoteSpiral || ''),
      timelines: mapList(
        chaos.timelines,
        function (t) {
          return { title: prose(t.title, true), odds: Number(t.odds) || 0, story: prose(t.story) };
        },
        base.chaos.timelines
      ),
      bossBattle: {
        enemy: prose((chaos.bossBattle && chaos.bossBattle.enemy) || base.chaos.bossBattle.enemy, true),
        hp: Number((chaos.bossBattle && chaos.bossBattle.hp) || 100),
        strategy: prose((chaos.bossBattle && chaos.bossBattle.strategy) || base.chaos.bossBattle.strategy),
        loot: ((chaos.bossBattle && chaos.bossBattle.loot) || base.chaos.bossBattle.loot || []).map(function (x) {
          return prose(x, true);
        }),
      },
      playlistMood: {
        title: prose((chaos.playlistMood && chaos.playlistMood.title) || base.chaos.playlistMood.title, true),
        tracks: ((chaos.playlistMood && chaos.playlistMood.tracks) || base.chaos.playlistMood.tracks || []).map(
          function (t) {
            return prose(t, true);
          }
        ),
        why: prose((chaos.playlistMood && chaos.playlistMood.why) || base.chaos.playlistMood.why),
      },
      closingMicDrop: prose(chaos.closingMicDrop || base.chaos.closingMicDrop),
      glitchAside: prose(chaos.glitchAside || base.chaos.glitchAside || ''),
      openTabs: mapList(
        adhd.openTabs,
        function (t) {
          return {
            title: prose(t.title, true),
            body: prose(t.body),
            urgency: Number(t.urgency) || 1,
          };
        },
        base.adhd.openTabs
      ),
      stickyNotes: mapList(
        adhd.stickyNotes,
        function (s) {
          return {
            color: String(s.color || 'yellow'),
            text: prose(s.text),
            tilt: Number(s.tilt) || 0,
          };
        },
        base.adhd.stickyNotes
      ),
      intrusiveThoughts: (adhd.intrusiveThoughts || base.adhd.intrusiveThoughts || []).map(function (t) {
        return prose(t);
      }),
      unfinishedDrafts: mapList(
        adhd.unfinishedDrafts,
        function (d) {
          return {
            start: prose(d.start, true),
            derail: prose(d.derail),
            abandonedAt: prose(d.abandonedAt, true),
          };
        },
        base.adhd.unfinishedDrafts
      ),
      rabbitHoles: mapList(
        adhd.rabbitHoles,
        function (r) {
          return {
            hook: prose(r.hook, true),
            depth: prose(r.depth),
            exitFail: prose(r.exitFail),
          };
        },
        base.adhd.rabbitHoles
      ),
      notifications: mapList(
        adhd.notifications,
        function (n) {
          return {
            app: prose(n.app, true),
            push: prose(n.push, true),
            read: !!n.read,
          };
        },
        base.adhd.notifications
      ),
      hyperfocus: {
        topic: prose((adhd.hyperfocus && adhd.hyperfocus.topic) || base.adhd.hyperfocus.topic, true),
        spiral: prose((adhd.hyperfocus && adhd.hyperfocus.spiral) || base.adhd.hyperfocus.spiral),
      },
      workingMemoryLeak: prose(adhd.workingMemoryLeak || base.adhd.workingMemoryLeak),
      brainDump: prose(stream.brainDump || base.stream.brainDump),
      waitWhat: (stream.waitWhat || base.stream.waitWhat || []).map(function (t) {
        return prose(t);
      }),
      parallelVoices: mapList(
        stream.parallelVoices,
        function (v) {
          return { name: prose(v.name, true), line: prose(v.line) };
        },
        base.stream.parallelVoices
      ),
      todoThatWillNeverHappen: mapList(
        stream.todoThatWillNeverHappen,
        function (t) {
          return { item: prose(t.item, true), excuse: prose(t.excuse) };
        },
        base.stream.todoThatWillNeverHappen
      ),
      finalScatter: prose(stream.finalScatter || base.stream.finalScatter),
      applied: !!(b.core || b.scientist || b.chaos || b.adhd || b.stream) && !meta.fallback,
    };
  }

  window.LabAi = {
    runLabBundle: runLabBundle,
    mapToUi: mapToUi,
    fallbackBundle: fallbackBundle,
  };
})();
