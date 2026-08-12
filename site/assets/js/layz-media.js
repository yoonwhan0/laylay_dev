'use strict';

(function () {
  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  async function fetchRecommendations(score, mode) {
    var res = await fetch('/api/media-recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        score: score,
        mode: mode
          ? {
              name: mode.name,
              label: mode.label,
            }
          : {},
      }),
    });
    var data = await res.json().catch(function () {
      return null;
    });
    if (!res.ok || !data || !Array.isArray(data.items)) return null;
    return data;
  }

  window.LayZMedia = { fetchRecommendations: fetchRecommendations };
})();
