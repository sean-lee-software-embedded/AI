// localStorage wrapper: every access is guarded so the site still works
// in private mode or when storage is blocked. Falls back to in-memory state.
const PREFIX = 'aiqx:';
const memory = {};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw);
  } catch { /* storage unavailable or corrupt */ }
  return key in memory ? memory[key] : fallback;
}

function write(key, value) {
  memory[key] = value;
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* ignore */ }
}

export const store = {
  get introSeen() { return read('introSeen', false); },
  set introSeen(v) { write('introSeen', v); },
  seen() { return new Set(read('seen', [])); },
  markSeen(id) {
    const s = this.seen();
    if (s.has(id)) return false;
    s.add(id);
    write('seen', [...s]);
    return true;
  },
  resetSeen() { write('seen', []); },
};
