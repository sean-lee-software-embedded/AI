// "Watched N times" counter for the duck page, kept by Abacus (abacus.jasoncameron.dev):
// a free, sign-up-free public counter with no cookies. Fails silently when unreachable or blocked.

const COUNTER = 'https://abacus.jasoncameron.dev/%s/ai-wuxia-chronicles/duck-watched';
const HIT_KEY = 'aiqx:duck-counted';

let value;
const ask = (verb) => fetch(COUNTER.replace('%s', verb))
  .then((r) => (r.ok ? r.json() : null))
  .then((j) => (Number.isFinite(j?.value) ? j.value : null))
  .catch(() => null);

/**
 * Current watch count, or null when unknown. With `visit`, also counts this visit —
 * once per browser session, so reloading the page doesn't inflate it.
 */
export function duckWatches({ visit = false } = {}) {
  let counted = true;
  try { counted = sessionStorage.getItem(HIT_KEY) === '1'; } catch { /* storage blocked: only read */ }
  if (visit && !counted) {
    try { sessionStorage.setItem(HIT_KEY, '1'); } catch { /* ignore */ }
    value = ask('hit');
  }
  value ??= ask('get');
  return value;
}
