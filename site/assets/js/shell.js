    (function () {
      var track = document.getElementById('frame-track');
      var panelSim = document.getElementById('panel-sim');
      var simTabs = document.getElementById('sim-tabs');
      var frameMong = document.getElementById('sim-frame-mong');
      var frameLayz = document.getElementById('sim-frame-layz');
      var currentKey = null;

      function activeFrame() {
        return currentKey === 'layz' ? frameLayz : frameMong;
      }

      var tabs = [
        { el: document.getElementById('tab-layz'), key: 'layz' },
        { el: document.getElementById('tab-mong'), key: 'mong' },
      ];

      var modeMsg = document.getElementById('dev-mode-msg');
      var runtimeBox = document.getElementById('dev-runtime-box');
      var selPreset = document.getElementById('dev-model-preset');
      var wrapCustom = document.getElementById('dev-model-custom-wrap');
      var inputCustom = document.getElementById('dev-model-custom');
      var covList = document.getElementById('cov-list');
      var covDetail = document.getElementById('cov-detail');
      var devToggle = document.getElementById('shell-dev-toggle');

      function syncDevPanelsToggle() {
        if (!devToggle) return;
        var collapsed = document.body.classList.contains('shell-dev-collapsed');
        devToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        devToggle.title = collapsed
          ? 'Dev tools 열기 — 모델·AI 담당 맵'
          : 'Dev tools 닫기';
      }
      if (devToggle) {
        syncDevPanelsToggle();
        devToggle.addEventListener('click', function () {
          document.body.classList.toggle('shell-dev-collapsed');
          syncDevPanelsToggle();
        });
        window.addEventListener('keydown', function (e) {
          if (e.key !== 'Escape') return;
          if (document.body.classList.contains('shell-dev-collapsed')) return;
          document.body.classList.add('shell-dev-collapsed');
          syncDevPanelsToggle();
          devToggle.focus();
        });
      }

      /** 시뮬별: 화면 구역이 AI 생성인지 / 고정·규칙인지 검수용 */
      var COVERAGE_BY_SIM = {
        layz: [
          {
            id: 'layz-q',
            label: '8문항 질문·보기',
            ai: false,
            short: '사전 작성 Q/A',
            detail: '모든 문항과 선택지는 HTML에 박힌 데이터(Qs 배열)입니다. 사용자가 고른 보기만 모이고, 모델 호출은 없습니다.',
          },
          {
            id: 'layz-score',
            label: 'Lay-Z 점수(숫자·막대만)',
            ai: false,
            short: '클라이언트 규칙만',
            detail: '캐릭터·「나의 Lay-Z 지수」·큰 숫자(#snum)·0~99 막대만 이 구역입니다. `calcScore()`로만 결정되며 모델 호출 없습니다.',
          },
          {
            id: 'layz-ai-copy',
            label: 'AI 본문 (#layz-ai-head·#layz-ai-desc)',
            ai: true,
            short: '같은 API 응답의 일부',
            detail: '`fetchLayZCopy` JSON의 tierName·tierTag·head·desc가 여기에 들어갑니다. DOM id는 `layz-ai-head`, `layz-ai-desc`. 키워드 칩은 설문에서 온 고정 라벨이고, 어제 대비 점수 배지도 규칙 계산입니다. AI 로딩 스트립·상태 한 줄도 이 블록 안에 있습니다. 실패 시 TIERS 고정 카피가 먼저 깔린 뒤 그대로일 수 있습니다.',
          },
          {
            id: 'layz-rec',
            label: '추천·수면 처방 카피',
            ai: true,
            short: 'POST /api/openai-dev',
            detail: '같은 호출의 recs(3)·rx(title·sub·items)가 아래 섹션에 반영됩니다. `layz-ai-copy`와 한 번에 받습니다. 실패·파싱 오류 시 TIERS 템플릿으로 폴백합니다.',
          },
          {
            id: 'layz-share',
            label: '공유 카드(캔버스)',
            ai: true,
            short: 'Canvas + AI 반영 카피',
            detail: 'Canvas 레이아웃·이미지 합성은 고정입니다. 그려 넣는 티어 이름·태그·헤드 등은 `st.lzTierForShare`(AI 병합본)가 있으면 우선 사용합니다.',
          },
          {
            id: 'layz-api',
            label: 'OpenAI / 런타임',
            ai: true,
            short: 'Lay-Z 결과 카피 호출',
            detail: 'Lay-Z 결과 본문·추천·수면 문구는 iframe에서 `POST /api/openai-dev`로 생성합니다. 모델·키는 개발 셸과 동기화됩니다.',
          },
        ],
        mong: [
          {
            id: 'mong-form',
            label: '입력 폼·무드·달력 UI',
            ai: false,
            short: '고정 UI',
            detail: '생년월일·꿈 입력 등은 마크업·스타일로 고정입니다. AI는 이 값을 읽어 프롬프트에 넣을 뿐, 폼 자체를 생성하지 않습니다.',
          },
          {
            id: 'mong-score',
            label: '종합 점수·링 그래프',
            ai: true,
            short: 'JSON 별점 합산',
            detail: '재물·애정·직장·건강 별 개수로 총점과 링을 그립니다. 값 자체는 모델이 준 JSON 필드입니다.',
          },
          {
            id: 'mong-oneline',
            label: '한줄평',
            ai: true,
            short: '한줄평 필드',
            detail: '`한줄평` 문자열을 그대로 표시합니다.',
          },
          {
            id: 'mong-fortune',
            label: '운세 분석 카드',
            ai: true,
            short: '분야별·총론 텍스트',
            detail: '각 운 설명·총론 설명 문단은 모델 JSON입니다. 접기 UI만 고정입니다.',
          },
          {
            id: 'mong-lucky',
            label: '행운의 색·숫자·물건',
            ai: true,
            short: '행운 3요소',
            detail: '`행운의색`, `행운의숫자`, `행운의물건` 필드를 카드에 넣습니다.',
          },
          {
            id: 'mong-tags',
            label: '행동 해시태그',
            ai: true,
            short: '`행동해시태그` 배열',
            detail: '모델이 준 해시태그 문자열을 칩으로 렌더합니다.',
          },
          {
            id: 'mong-mock',
            label: 'API 실패·파싱 실패 시',
            ai: false,
            short: 'MOCK 폴백',
            detail: '오류나 JSON 깨짐 시 MOCK 상수로 위 필드를 채웁니다. 강조는 본문 양이 많은 운세 카드 영역을 대표로 보여 줍니다.',
          },
          {
            id: 'mong-ui',
            label: '결과 레이아웃·탭·무드 뱃지',
            ai: false,
            short: '템플릿 렌더',
            detail: '탭, 접기 아이콘, 공유/재시도 버튼, 선택한 기분 뱃지 등은 고정 UI입니다.',
          },
          {
            id: 'mong-feed',
            label: '도감 피드·시드 데이터',
            ai: false,
            short: 'localStorage 규칙',
            detail: '피드에 쌓이는 예시 항목과 저장 로직은 클라이언트 규칙입니다. AI가 피드 문구를 따로 쓰지는 않습니다.',
          },
        ],
      };

      function renderCoverage(simKey) {
        var rows = COVERAGE_BY_SIM[simKey] || [];
        covList.innerHTML = '';
        covDetail.textContent = '항목을 선택하면 상세 설명이 여기 표시됩니다.';
        covDetail.classList.add('muted');
        rows.forEach(function (row) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'cov-row';
          btn.setAttribute('aria-pressed', 'false');
          var badgeClass = row.ai ? 'cov-badge ai' : 'cov-badge fixed';
          var badgeText = row.ai ? 'AI' : '고정';
          btn.innerHTML =
            '<div class="cov-row-top">' +
            '<span class="cov-label">' +
            row.label +
            '</span>' +
            '<span class="' +
            badgeClass +
            '">' +
            badgeText +
            '</span></div>' +
            '<div class="cov-sub">' +
            row.short +
            '</div>';
          btn.addEventListener('click', function () {
            covList.querySelectorAll('.cov-row').forEach(function (r) {
              r.setAttribute('aria-pressed', 'false');
            });
            btn.setAttribute('aria-pressed', 'true');
            covDetail.classList.remove('muted');
            covDetail.textContent = row.detail;
            broadcastHighlight(row.id);
          });
          covList.appendChild(btn);
        });
      }

      function select(key) {
        if (currentKey !== null && key === currentKey) return;
        var prev = currentKey;
        currentKey = key;
        track.classList.remove('frame-track--mong', 'frame-track--layz');
        track.classList.add(key === 'mong' ? 'frame-track--mong' : 'frame-track--layz');
        if (simTabs) {
          simTabs.classList.remove('tabs--mong', 'tabs--layz');
          simTabs.classList.add(key === 'mong' ? 'tabs--mong' : 'tabs--layz');
        }
        if (prev !== null && prev !== key && panelSim) {
          panelSim.classList.add('frame-wrap--motion');
          clearTimeout(window._simSlideT);
          window._simSlideT = setTimeout(function () {
            panelSim.classList.remove('frame-wrap--motion');
          }, 820);
        }
        tabs.forEach(function (t) {
          var on = t.key === key;
          t.el.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        var simEl = document.getElementById('dev-active-sim');
        if (simEl)
          simEl.textContent =
            key === 'mong' ? '지금 보는 시뮬: Lay-몽' : '지금 보는 시뮬: Lay-Z력 테스트';
        if (key === 'layz') {
          runtimeBox.textContent =
            'Lay-Z 결과 카피는 iframe에서 POST /api/openai-dev 호출 · 셸 모델·키 동기화';
        } else {
          runtimeBox.textContent = 'Lay-몽 실행 시 런타임이 여기 표시됩니다.';
        }
        renderCoverage(key);
        broadcastDevToFrame();
      }

      tabs[0].el.addEventListener('click', function () { select('layz'); });
      tabs[1].el.addEventListener('click', function () { select('mong'); });

      function syncCustomModelVisible() {
        wrapCustom.hidden = selPreset.value !== '__custom__';
      }
      selPreset.addEventListener('change', syncCustomModelVisible);
      syncCustomModelVisible();

      function resolvedModel() {
        if (selPreset.value === '__custom__')
          return (inputCustom.value || '').trim() || 'gpt-4o-mini';
        return selPreset.value;
      }

      function pushModelToShellSession() {
        try {
          sessionStorage.setItem('laylay_dev_openai_model', resolvedModel());
        } catch (e) {}
      }

      /** 두 iframe 모두에 모델 동기화(전환 시 대기 중인 쪽까지 반영) */
      function broadcastDevToFrame() {
        pushModelToShellSession();
        var payload = {
          source: 'laylay-shell',
          type: 'laylay-dev-sync',
          apiKey: '',
          model: resolvedModel(),
        };
        [frameMong, frameLayz].forEach(function (fr) {
          try {
            if (fr.contentWindow) fr.contentWindow.postMessage(payload, '*');
          } catch (e) {}
        });
      }

      /** 우측 대시보드에서 선택한 구역을 iframe 안에서 붉게 깜빡임 */
      function broadcastHighlight(regionId) {
        if (regionId === 'mong-mock') regionId = 'mong-fortune';
        var fr = activeFrame();
        if (!fr.contentWindow || !regionId) return;
        try {
          fr.contentWindow.postMessage(
            {
              source: 'laylay-shell',
              type: 'laylay-highlight',
              regionId: regionId,
            },
            '*'
          );
        } catch (e) {}
      }

      selPreset.addEventListener('change', function () {
        pushModelToShellSession();
        broadcastDevToFrame();
      });
      inputCustom.addEventListener('change', function () {
        pushModelToShellSession();
        broadcastDevToFrame();
      });
      inputCustom.addEventListener('blur', function () {
        pushModelToShellSession();
        broadcastDevToFrame();
      });

      [frameMong, frameLayz].forEach(function (fr) {
        fr.addEventListener('load', function () {
          broadcastDevToFrame();
        });
      });

      pushModelToShellSession();

      function updateModeGuide() {
        var h = location.hostname || '';
        var isLocal = h === 'localhost' || h === '127.0.0.1' || h === '';
        if (isLocal) {
          modeMsg.innerHTML =
            '로컬 주소로 보입니다.<br>API가 안 붙어 있으면 시뮬은 Mock 쪽으로 떨어질 수 있어요.';
        } else {
          modeMsg.innerHTML =
            '배포 주소로 보입니다.<br>백엔드에서 upstream만 연결돼 있으면 모델 선택만으로 테스트하면 됩니다.';
        }
      }

      window.addEventListener('message', function (e) {
        var d = e.data;
        if (!d || d.source !== 'laylay-sim' || d.type !== 'runtime') return;
        var af = activeFrame();
        if (!af || !af.contentWindow) return;
        if (e.source !== af.contentWindow) return;
        var ms = typeof d.elapsed_ms === 'number' ? d.elapsed_ms + 'ms' : '-';
        var status = d.status || 'unknown';
        var detail = d.detail ? ' / ' + d.detail : '';
        runtimeBox.textContent = '[' + (d.sim || 'sim') + '] ' + ms + ' · ' + status + detail;
      });

      updateModeGuide();
      select('mong');
    })();
