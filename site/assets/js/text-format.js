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
    return escapeHtml(formatProse(text, options));
  }

  window.LayTextFormat = {
    normalize: normalizeAiText,
    formatProse: formatProse,
    formatHtml: formatHtml,
    escapeHtml: escapeHtml,
  };
})();
