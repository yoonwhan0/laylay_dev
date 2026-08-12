'use strict';

(function () {
  function normalizeAiText(text) {
    if (text == null || text === '') return '';
    return String(text)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\r\n/g, '\n')
      .replace(/\u2028/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function autoBreakProse(text) {
    var s = normalizeAiText(text);
    if (!s) return '';
    if (s.indexOf('\n') >= 0) return s;

    return s
      .replace(/([.!?…])(['"」』\]）)]*)\s+(?=[가-힣A-Za-z「『(\[])/g, '$1$2\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function formatProse(text, options) {
    var opts = options || {};
    var s = normalizeAiText(text);
    if (!s) return '';
    if (opts.singleLine) return s.replace(/\s*\n+\s*/g, ' ').trim();
    return autoBreakProse(s);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatHtml(text, options) {
    var opts = options || {};
    var s = escapeHtml(formatProse(text, opts));
    if (!s) return '';
    if (opts.singleLine) return s;
    return s.replace(/\n/g, '<br>');
  }

  function limitLines(text, maxLines) {
    var s = formatProse(text);
    if (!s || !maxLines) return s;
    var lines = s.split('\n').filter(function (line) {
      return line.trim();
    });
    if (lines.length <= maxLines) return lines.join('\n');
    return lines.slice(0, maxLines).join('\n');
  }

  function limitSentences(text, maxSentences) {
    var s = normalizeAiText(text).replace(/\n+/g, ' ').trim();
    if (!s || !maxSentences) return s;
    var parts = s.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [s];
    return parts
      .slice(0, maxSentences)
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean)
      .join('\n');
  }

  function formatResultHead(text) {
    var s = formatProse(text, { singleLine: true });
    if (!s) return '';
    if (s.indexOf('\n') >= 0) return limitLines(s, 2);
    var split = s.match(/^(.+?[.!?…])\s+(.+)$/);
    if (split && split[2]) return split[1] + '\n' + split[2];
    return s;
  }

  function formatResultDesc(text) {
    return limitLines(limitSentences(text, 3), 3);
  }

  function formatRecommendDesc(text) {
    return limitLines(limitSentences(text, 3), 3);
  }

  function formatSleepItemText(text) {
    return limitLines(limitSentences(text, 2), 2);
  }

  var BADGE_KO = {
    chill: '휴식',
    breathe: '호흡',
    walk: '산책',
    sleep: '수면',
    stretch: '스트레칭',
    rest: '휴식',
    'phone-off': '디톡스',
    phone: '디톡스',
    bed: '수면',
    light: '조명',
    alarm: '리듬',
    temperature: '온도',
    drink: '수분',
    moon: '휴식',
    music: '휴식',
    book: '마음',
    mask: '휴식',
    sofa: '휴식',
    active: '활동',
    move: '활동',
    calm: '마음',
    focus: '집중',
  };

  function toKoreanBadge(tag) {
    var raw = String(tag || '').trim();
    if (!raw) return '추천';
    if (/[가-힣]/.test(raw)) return raw;
    var key = raw.toLowerCase().replace(/\s+/g, '-');
    return BADGE_KO[key] || '추천';
  }

  window.LayTextFormat = {
    normalize: normalizeAiText,
    formatProse: formatProse,
    formatHtml: formatHtml,
    escapeHtml: escapeHtml,
    limitLines: limitLines,
    limitSentences: limitSentences,
    formatResultHead: formatResultHead,
    formatResultDesc: formatResultDesc,
    formatRecommendDesc: formatRecommendDesc,
    formatSleepItemText: formatSleepItemText,
    toKoreanBadge: toKoreanBadge,
  };
})();
