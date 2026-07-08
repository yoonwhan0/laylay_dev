(function () {
  const FORBIDDEN_WORDS = [
    "시발",
    "씨발",
    "씨팔",
    "개새끼",
    "개새",
    "병신",
    "븅신",
    "지랄",
    "좆",
    "씹",
    "니미",
    "느금",
    "fuck",
    "shit",
    "bitch",
    "asshole",
  ];

  function normalizeForCheck(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[\s._\-*]+/g, "");
  }

  function hasForbiddenWord(text) {
    const normalized = normalizeForCheck(text);
    return FORBIDDEN_WORDS.some((word) => normalized.includes(word));
  }

  function countHangulSyllables(text) {
    return (text.match(/[가-힣]/g) || []).length;
  }

  function countJamo(text) {
    return (text.match(/[ㄱ-ㅎㅏ-ㅣ]/g) || []).length;
  }

  function isGibberishDream(text) {
    const trimmed = text.trim();
    const compact = trimmed.replace(/\s/g, "");
    if (!compact) return true;

    const hangul = countHangulSyllables(trimmed);
    const jamo = countJamo(trimmed);

    if (jamo >= 2 && hangul === 0) return true;
    if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(compact)) return true;
    if (/^(.)\1{4,}$/.test(compact)) return true;
    if (/^([ㄱ-ㅎㅏ-ㅣ]{1,4})\1{2,}$/.test(compact)) return true;
    if (/^[asdfghjklqwertyuiopzxcvbnm]{5,}$/i.test(compact)) return true;
    if (/^[\d\W]+$/.test(compact)) return true;

    const meaningful = trimmed.replace(/[\s\d.,!?~…\-'"()]/g, "");
    if (meaningful.length < 4) return true;
    if (jamo > 0 && hangul > 0 && jamo / compact.length > 0.35) return true;

    return false;
  }

  function validateDreamContent(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed) return { ok: false, reason: "empty" };
    if (hasForbiddenWord(trimmed)) return { ok: false, reason: "forbidden" };
    if (isGibberishDream(trimmed)) return { ok: false, reason: "gibberish" };
    return { ok: true };
  }

  window.LayMongValidate = {
    validateDreamContent,
    hasForbiddenWord,
    isGibberishDream,
  };
})();
