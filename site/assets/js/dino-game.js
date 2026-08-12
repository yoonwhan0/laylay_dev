'use strict';

/**
 * Module 06 — Lay-Z Runner (Chrome dino-style)
 * Lay-Z 점수 낮음(안 게으름) → 빠름 / 높음(게으름) → 느림
 */
(function () {
  var active = null;

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function baseSpeedFromLz(lz) {
    var t = clamp(Number(lz) || 0, 0, 99) / 99;
    return 9.2 - t * 6.8;
  }

  function speedLabel(lz) {
    var s = Number(lz) || 0;
    if (s <= 19) return 'MAX SPEED';
    if (s <= 39) return 'FAST';
    if (s <= 59) return 'NORMAL';
    if (s <= 79) return 'SLOW';
    return 'ULTRA SLOW';
  }

  function jumpMsFromLz(lz) {
    var t = clamp(Number(lz) || 0, 0, 99) / 99;
    return Math.round(420 + t * 220);
  }

  function destroy() {
    if (!active) return;
    clearInterval(active.scoreTimer);
    clearInterval(active.loopTimer);
    if (active.onKey) document.removeEventListener('keydown', active.onKey);
    if (active.root && active.onPointer) {
      active.root.removeEventListener('pointerdown', active.onPointer);
    }
    active = null;
  }

  function mount(root, opts) {
    destroy();
    if (!root) return null;

    var lz = clamp(Number(opts && opts.lzScore) || 0, 0, 99);
    var baseSpeed = baseSpeedFromLz(lz);
    var jumpMs = jumpMsFromLz(lz);
    var modeLabel = (opts && opts.modeLabel) || '';

    root.innerHTML =
      '<div class="dino-shell">' +
      '<div class="dino-meta">' +
      '<span>Lay-Z ' +
      lz +
      '점' +
      (modeLabel ? ' · ' + modeLabel : '') +
      '</span>' +
      '<span class="dino-speed-tag">' +
      speedLabel(lz) +
      '</span>' +
      '</div>' +
      '<div class="dino-game" id="dino-game-stage" tabindex="0">' +
      '<div class="dino-hud">SCORE: <span data-dino-score>00000</span></div>' +
      '<div class="dino-char" data-dino-char style="--dino-jump-ms:' +
      jumpMs +
      'ms"></div>' +
      '<div class="dino-cactus" data-dino-cactus></div>' +
      '<div class="dino-floor"></div>' +
      '<div class="dino-over" data-dino-over hidden>' +
      '<strong>G A M E  O V E R</strong>' +
      '<p>스페이스 / 탭으로 다시 시작</p>' +
      '</div>' +
      '</div>' +
      '<p class="dino-hint">스페이스바 또는 화면 탭으로 점프 · 점수가 낮을수록 장애물이 빠릅니다</p>' +
      '</div>';

    var stage = root.querySelector('#dino-game-stage');
    var charEl = root.querySelector('[data-dino-char]');
    var cactusEl = root.querySelector('[data-dino-cactus]');
    var scoreEl = root.querySelector('[data-dino-score]');
    var overEl = root.querySelector('[data-dino-over]');

    var state = {
      alive: true,
      score: 0,
      cactusX: 600,
      speed: baseSpeed,
      scoreTimer: 0,
      loopTimer: 0,
      root: stage,
      onKey: null,
      onPointer: null,
    };

    function setScoreText() {
      scoreEl.textContent = String(state.score).padStart(5, '0');
    }

    function jump() {
      if (!state.alive) return;
      if (charEl.classList.contains('is-jump')) return;
      charEl.classList.add('is-jump');
      setTimeout(function () {
        charEl.classList.remove('is-jump');
      }, jumpMs);
    }

    function endGame() {
      state.alive = false;
      clearInterval(state.scoreTimer);
      clearInterval(state.loopTimer);
      overEl.hidden = false;
    }

    function startLoops() {
      clearInterval(state.scoreTimer);
      clearInterval(state.loopTimer);

      state.scoreTimer = setInterval(function () {
        if (!state.alive) return;
        state.score += 1;
        setScoreText();
        if (state.score % 200 === 0) state.speed += 0.35;
      }, 100);

      state.loopTimer = setInterval(function () {
        if (!state.alive) return;
        state.cactusX -= state.speed;
        if (state.cactusX < -20) state.cactusX = 600 + Math.random() * 90;
        cactusEl.style.left = state.cactusX + 'px';

        var dinoBottom = parseInt(window.getComputedStyle(charEl).bottom, 10) || 0;
        if (state.cactusX > 50 && state.cactusX < 90 && dinoBottom < 40) {
          endGame();
        }
      }, 10);
    }

    function resetGame() {
      state.alive = true;
      state.score = 0;
      state.cactusX = 600;
      state.speed = baseSpeed;
      overEl.hidden = true;
      charEl.classList.remove('is-jump');
      cactusEl.style.left = '600px';
      setScoreText();
      startLoops();
    }

    state.onKey = function (e) {
      if (e.code !== 'Space') return;
      e.preventDefault();
      if (state.alive) jump();
      else resetGame();
    };
    state.onPointer = function (e) {
      e.preventDefault();
      if (state.alive) jump();
      else resetGame();
    };

    document.addEventListener('keydown', state.onKey);
    stage.addEventListener('pointerdown', state.onPointer);
    active = state;
    setScoreText();
    startLoops();
    try {
      stage.focus({ preventScroll: true });
    } catch (e) {
      stage.focus();
    }

    return { lz: lz, baseSpeed: baseSpeed, label: speedLabel(lz) };
  }

  window.LayDinoGame = {
    mount: mount,
    destroy: destroy,
    baseSpeedFromLz: baseSpeedFromLz,
    speedLabel: speedLabel,
  };
})();
