export const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    // sanitize
    const c = Number(data?.correct);
    const t = Number(data?.total);
    if (Number.isFinite(c) && Number.isFinite(t)) return { correct: c, total: t };
    return fallback;
  } catch {
    return fallback;
  }
};

export const save = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
