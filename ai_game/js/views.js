import { db, asset, present } from './data.js';
import { t, L, altBoth, RANKS, getLang } from './i18n.js';
import { store } from './store.js';
import { duckWatches } from './stats.js';
import { h, ext, factionColor, factionTag, heroTile, importanceLabel, bondLabel, logoSrcs } from './ui.js';

const go = (hash) => { location.hash = hash; };
const openHero = (id) => go(`#/c/${id}`);

function sceneBanner(src, nameObj, color) {
  const banner = h('div', { class: 'scene', style: { '--accent': color } });
  if (present(src)) {
    const img = h('img', { src: asset(src), alt: altBoth(nameObj), decoding: 'async' });
    img.addEventListener('error', () => img.remove());
    banner.append(img);
  }
  return banner;
}

/**
 * Keynote-style slide recreating the GTC ecosystem slide for one faction:
 * the original English category (and slide title, when known) over a text-only
 * logo wall, spelled and ordered as on the slide (`slideName` overrides per
 * faction). Logos are used for identification only; the name is always shown.
 */
function keynoteSlide(f, members) {
  const slide = h('figure', { class: 'slide', style: { '--accent': f.color } },
    present(f.image) ? h('img', { class: 'slide-bg', src: asset(f.image), alt: '', onerror: (e) => e.target.remove() }) : null,
    h('figcaption', { class: 'slide-head' },
      h('span', { class: 'slide-kicker' }, t('keynoteKicker')),
      h('span', { class: 'slide-title' }, f.slideTitle || f.slideLabel),
      f.slideTitle ? h('span', { class: 'slide-label' }, f.slideLabel) : null),
    h('ul', { class: 'slide-wall' }, members
      .map((e) => ({ e, label: e.slideName?.[f.id] || e.name.en }))
      .sort((a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' }))
      .map(({ e, label }) => h('li', {}, h('a', { href: `#/c/${e.id}` }, wallLogo(e, label), h('span', {}, label))))),
  );
  return slide;
}

/** Logo for the slide wall; on failure the tile simply shows the name. */
function wallLogo(e, label) {
  const queue = logoSrcs(e);
  if (!queue.length) return null;
  const img = h('img', { class: 'wall-logo', src: asset(queue.shift()), alt: '', loading: 'lazy', decoding: 'async' });
  img.addEventListener('load', () => img.closest('a')?.classList.add('has-logo'));
  img.addEventListener('error', () => (queue.length ? (img.src = asset(queue.shift())) : img.remove()));
  return img;
}

const progress = (fid) => {
  const members = db.membersOf(fid);
  const seen = store.seen();
  return { got: members.filter((m) => seen.has(m.id)).length, total: members.length };
};

/* ---------- 1. Intro comic ---------- */

const PANELS = [
  { zh: '很久很久以前，江湖高手各自練功，一招一式慢慢算，練一套武功要好多年。', en: 'Long ago, every hero trained alone, working out each move by hand. Mastering one art took years.' },
  { zh: '鑄劍山莊的皮衣盟主打造出一種神兵（GPU），能同時出千百招，練功快了好幾倍。', en: 'Then the Leather-Jacket Grandmaster of Sword Forge Manor forged a divine weapon — the GPU — that strikes a thousand blows at once.' },
  { zh: '盟主還傳下一套獨門心法（CUDA）。高手學會之後，換別家兵器就很不順手。', en: 'He also taught a Secret Art — CUDA. Once heroes learned it, no other blade felt right in their hands.' },
  { zh: '於是少林寺、天下五絕、萬名少俠全都來到山莊。一套心法，打遍天下！', en: 'So temples, the Five Greats and ten thousand young heroes all came to the Manor. One Secret Art to rule the jianghu!' },
];

export function introView(root) {
  let i = 0;
  const finish = () => { store.introSeen = true; go('#/map'); };
  const render = () => {
    const p = PANELS[i];
    const last = i === PANELS.length - 1;
    root.replaceChildren(h('section', { class: 'intro', 'aria-roledescription': 'comic' },
      h('div', { class: 'intro-top' },
        h('span', { class: 'muted' }, `${i + 1} / ${PANELS.length}`),
        h('button', { class: 'btn-text', type: 'button', onclick: finish }, t('introSkip'))),
      h('figure', { class: 'panel' },
        sceneBanner(`assets/intro/${i + 1}.webp`, p, db.leader.color),
        h('figcaption', { class: 'bubble', 'aria-live': 'polite' }, L(p))),
      h('div', { class: 'dots', 'aria-hidden': 'true' }, PANELS.map((_, j) => h('span', { class: j === i ? 'on' : '' }))),
      h('button', { class: 'btn', type: 'button', onclick: () => (last ? finish() : (i += 1, render())) },
        last ? t('introEnter') : t('introNext')),
    ));
    root.querySelector('.btn').focus({ preventScroll: true });
  };
  render();
}

/* ---------- 2. Map ---------- */

export function mapView(root) {
  const nodes = db.factionList.map((f) => {
    const { got, total } = progress(f.id);
    return h('a', { class: 'map-node', href: `#/f/${f.id}`, style: { left: `${f.map.x}%`, top: `${f.map.y}%`, '--accent': f.color } },
      h('span', { class: 'map-name' }, f.slideLabel),
      h('span', { class: 'map-sub' }, L(f.name)),
      h('span', { class: 'map-count' }, `${got}/${total}`));
  });
  const lines = db.factionList.map((f) => `<line x1="50" y1="50" x2="${f.map.x}" y2="${f.map.y}" />`).join('');
  const holder = h('div');
  holder.innerHTML = `<svg class="map-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>`;
  const svg = holder.firstElementChild;

  const map = h('div', { class: 'map' },
    h('img', { class: 'map-bg', src: asset('assets/map.webp'), alt: '', onerror: (e) => e.target.remove() }),
    svg,
    h('a', { class: 'map-node map-leader', href: '#/f/nvidia', style: { left: '50%', top: '50%', '--accent': db.leader.color } },
      h('span', { class: 'map-name' }, db.leader.slideLabel),
      h('span', { class: 'map-count' }, t('leaderCta'))),
    nodes);

  const list = h('ul', { class: 'faction-list' }, db.factionList.map((f) => {
    const { got, total } = progress(f.id);
    return h('li', {}, h('a', { href: `#/f/${f.id}`, class: 'faction-row', style: { '--accent': f.color } },
      h('span', { class: 'swatch', 'aria-hidden': 'true' }),
      h('span', { class: 'row-text' }, h('strong', {}, f.slideLabel), h('span', { class: 'muted small' }, `${L(f.name)} · ${L(f.short)}`)),
      h('span', { class: 'meter', role: 'img', 'aria-label': `${got}/${total}` },
        h('span', { style: { width: `${total ? (got / total) * 100 : 0}%` } })),
      h('span', { class: 'small' }, `${got}/${total}`)));
  }));

  root.replaceChildren(h('section', {},
    duckBanner(),
    h('p', { class: 'kicker' }, t('keynoteKicker')),
    h('h1', {}, t('mapTitle')),
    h('p', { class: 'lead' }, t('mapLead')),
    db.factions.keynote?.video ? h('p', {}, h('a', { href: db.factions.keynote.video.url, target: '_blank', rel: 'noopener noreferrer', title: db.factions.keynote.video.title }, t('watchKeynote'))) : null,
    map, list,
    h('p', { class: 'center' }, h('a', { href: '#/intro', class: 'btn-text' }, t('introReplay')))));
}

/* ---------- 2b. Easter egg: the Grandmaster and the robot ducks ---------- */

/** Picture for a duck scene, or the emoji stand-in until the art exists. */
function duckArt(src, emoji, cls) {
  const stand = () => h('span', { class: `${cls} duck-emoji`, 'aria-hidden': 'true' }, emoji);
  if (!present(src)) return stand();
  return h('img', { class: cls, src: asset(src), alt: '', decoding: 'async', onerror: (e) => e.target.replaceWith(stand()) });
}

/** "Watched N times" badge; stays hidden until the count arrives, or for good if the counter is unreachable. */
function duckWatched(cls, visit = false) {
  const badge = h('span', { class: cls, hidden: true });
  duckWatches({ visit }).then((n) => {
    if (!n) return;
    badge.textContent = t('watched', { n: n.toLocaleString(getLang() === 'zh' ? 'zh-TW' : 'en-US') });
    badge.hidden = false;
  });
  return badge;
}

function duckBanner() {
  const d = db.duck;
  return h('a', { class: 'duck-hero', href: '#/duck' },
    duckArt(d.image, '🧥\n🦆🦆\n🦆🦆', 'duck-hero-art'),
    h('span', { class: 'duck-hero-text' },
      h('span', { class: 'duck-kicker' }, L(d.kicker), ' ', duckWatched('duck-watched')),
      h('strong', { class: 'duck-hero-title' }, L(d.title)),
      h('span', { class: 'duck-hero-teaser' }, L(d.teaser)),
      h('span', { class: 'duck-cta', 'aria-hidden': 'true' }, L(d.cta))));
}

export function duckView(root) {
  const d = db.duck;
  const termLinks = (ids) => ids.map((id) => db.glossary.find((g) => g.id === id)).filter(Boolean)
    .map((g) => h('a', { class: 'tag tag-plain', href: `#/dict/${g.id}` }, L(g.real)));
  root.replaceChildren(h('article', { class: 'duck' },
    h('p', {}, h('a', { href: '#/map', class: 'btn-text' }, t('back'))),
    h('p', { class: 'duck-kicker' }, L(d.kicker), ' ', duckWatched('duck-watched', true)),
    h('h1', {}, L(d.title)),
    h('p', { class: 'lead' }, L(d.lead)),
    h('ol', { class: 'duck-panels' }, d.panels.map((p, i) => h('li', { class: 'duck-panel' },
      duckArt(p.image, p.emoji, 'duck-panel-art'),
      h('span', { class: 'duck-num', 'aria-hidden': 'true' }, i + 1),
      h('p', { class: 'duck-caption' }, L(p.caption)),
      getLang() === 'zh' ? h('p', { class: 'duck-quote', lang: 'en' }, `“${p.quote}”`) : null))),
    h('h2', {}, L(d.videosTitle)),
    h('p', { class: 'muted small' }, L(d.videosLead)),
    h('ul', { class: 'duck-videos' }, d.videos.filter((v) => !v.lang || v.lang === getLang()).map((v) => h('li', { class: 'duck-video' },
      h('p', { class: 'duck-video-meta' }, L(v.meta)),
      h('h3', {}, L(v.headline)),
      h('p', {}, L(v.blurb)),
      h('a', { class: 'btn', href: v.url, target: '_blank', rel: 'noopener noreferrer' },
        L(v.label), h('span', { class: 'sr-only' }, ' (new tab)'))))),
    h('h2', {}, L(d.labTitle)),
    h('p', { class: 'muted small' }, L(d.labLead), ' ', ext(d.labLink.url, L(d.labLink.title))),
    h('ul', { class: 'duck-videos' }, d.lab.map((c) => h('li', { class: 'duck-video' },
      h('video', {
        class: 'duck-clip', src: asset(c.src), poster: present(c.poster) ? asset(c.poster) : null,
        controls: true, muted: true, loop: true, playsinline: true, preload: 'none', 'aria-label': L(c.headline),
      }),
      h('p', { class: 'duck-video-meta' }, L(c.meta)),
      h('h3', {}, L(c.headline)),
      h('p', {}, L(c.blurb))))),
    h('h2', {}, L(d.lessonsTitle)),
    h('p', { class: 'muted small' }, L(d.lessonsLead)),
    h('ol', { class: 'duck-lessons' }, d.lessons.map((f) => h('li', {}, h('details', { class: 'learn' },
      h('summary', {}, L(f.title)),
      h('p', {}, L(f.body)),
      f.terms?.length ? h('p', { class: 'learn-terms small' }, t('learnTerms'), termLinks(f.terms)) : null,
      h('ol', { class: 'sources small' }, f.sources.map((s) => h('li', {}, ext(s.url, s.title)))))))),
    h('h2', {}, t('sources')),
    h('ol', { class: 'sources small' }, d.sources.map((s) => h('li', {}, ext(s.url, s.title)))),
    h('p', { class: 'small muted' }, L(d.note)),
    h('p', { class: 'center' }, h('a', { href: '#/map', class: 'btn' }, t('back')))));
}

/* ---------- 3. Faction page (and the Grandmaster's page) ---------- */

// Kept across re-renders (e.g. language switch, closing a card) for the same faction.
const filters = { fid: null, q: '', imp: '', bond: '' };

function leaderView(root) {
  const n = db.leader;
  const ext = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text);
  root.replaceChildren(h('section', { style: { '--accent': n.color } },
    h('a', { href: '#/map', class: 'btn-text' }, t('back')),
    sceneBanner(n.image, n.name, n.color),
    h('h1', {}, L(n.name)),
    h('p', { class: 'muted' }, `${t('realName')}${t('colon')}${L(n.real)}`),
    h('blockquote', { class: 'bubble' }, L(n.plain)),
    h('p', {}, L(n.story)),
    h('ul', { class: 'links' },
      h('li', {}, ext(n.links.official, t('linkOfficial'))),
      h('li', {}, ext(n.links.about, t('linkAbout')))),
    h('h2', {}, t('mapTitle')),
    h('div', { class: 'tags' }, db.factionList.map((f) => factionTag(f.id)))));
}

export function factionView(root, fid) {
  if (fid === 'nvidia') return leaderView(root);
  const f = db.factionById[fid];
  if (!f) return notFoundView(root);
  if (filters.fid !== fid) Object.assign(filters, { fid, q: '', imp: '', bond: '' });
  const members = db.membersOf(fid)
    .sort((a, b) => b.importance - a.importance || L(a.name).localeCompare(L(b.name)));
  const { got, total } = progress(fid);

  const grid = h('ul', { class: 'tiles' });
  const empty = h('p', { class: 'muted', hidden: true }, t('noResults'));
  const apply = () => {
    const q = filters.q.trim().toLowerCase();
    const shown = members.filter((e) => {
      if (filters.imp && String(e.importance) !== filters.imp) return false;
      if (filters.bond && !e.nvidiaBond.types.includes(filters.bond)) return false;
      if (!q) return true;
      return [e.name.zh, e.name.en, e.nickname.zh, e.nickname.en, e.id].join(' ').toLowerCase().includes(q);
    });
    grid.replaceChildren(...shown.map((e) => heroTile(e, openHero)));
    empty.hidden = shown.length > 0;
  };

  const opt = (value, label, current) => h('option', { value, selected: value === current }, label);
  const search = h('input', { type: 'search', placeholder: t('search'), 'aria-label': t('search'), value: filters.q,
    oninput: (e) => { filters.q = e.target.value; apply(); } });
  const impSel = h('select', { 'aria-label': t('filterImportance'), onchange: (e) => { filters.imp = e.target.value; apply(); } },
    opt('', `${t('filterImportance')}${t('colon')}${t('all')}`, filters.imp), ['3', '2', '1'].map((n) => opt(n, importanceLabel(n), filters.imp)));
  const bondSel = h('select', { 'aria-label': t('filterBond'), onchange: (e) => { filters.bond = e.target.value; apply(); } },
    opt('', `${t('filterBond')}${t('colon')}${t('all')}`, filters.bond),
    ['customer', 'partner', 'investee', 'supplier'].map((b) => opt(b, bondLabel(b), filters.bond)));

  root.replaceChildren(h('section', { style: { '--accent': f.color } },
    h('a', { href: '#/map', class: 'btn-text' }, t('back')),
    keynoteSlide(f, members),
    h('h1', {}, f.slideLabel, ' ', h('span', { class: 'h1-sub' }, `${L(f.name)} · ${L(f.short)}`), ' ', h('span', { class: 'count' }, `${got}/${total}`)),
    h('p', { class: 'lead' }, L(f.plain)),
    f.sources?.length ? h('p', { class: 'small' }, `${t('sources')}${t('colon')}`, f.sources.map((s, i) => [i ? t('listSep') : '',
      h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title)])) : null,
    h('div', { class: 'controls' }, search, impSel, bondSel),
    grid, empty));
  apply();
}

/* ---------- 5. My scroll (collection) ---------- */

export function rankFor(ratio) {
  let idx = 0;
  RANKS.forEach((r, i) => { if (ratio >= r.min) idx = i; });
  return idx;
}

export function bookView(root) {
  const seen = store.seen();
  const total = db.entities.length;
  const got = db.entities.filter((e) => seen.has(e.id)).length;
  const ratio = total ? got / total : 0;
  const idx = rankFor(ratio);
  const next = RANKS[idx + 1];
  const need = next ? Math.ceil(next.min * total) - got : 0;

  const groups = db.factionList.map((f) => {
    const mine = db.entities.filter((e) => e.primaryFaction === f.id);
    const collected = mine.filter((e) => seen.has(e.id));
    return h('section', { class: 'book-group', style: { '--accent': f.color } },
      h('h2', {}, f.slideLabel, ' ', h('span', { class: 'h1-sub' }, L(f.name)), ' ', h('span', { class: 'count' }, `${collected.length}/${mine.length}`)),
      collected.length
        ? h('ul', { class: 'tiles' }, collected.map((e) => heroTile(e, openHero)))
        : h('p', { class: 'muted small' }, '—'));
  });

  root.replaceChildren(h('section', {},
    h('h1', {}, t('bookTitle')),
    h('p', { class: 'lead' }, t('bookLead')),
    h('div', { class: 'rank-card' },
      h('p', { class: 'muted small' }, t('bookRank')),
      h('p', { class: 'rank' }, `🦐 ${L(RANKS[idx])}`),
      h('div', { class: 'meter big', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': total, 'aria-valuenow': got },
        h('span', { style: { width: `${ratio * 100}%` } })),
      h('p', {}, `${got} / ${total}`),
      h('p', { class: 'small' }, next ? t('bookNext', { n: need, rank: L(next) }) : t('bookMax'))),
    groups,
    h('p', { class: 'center' }, h('button', { class: 'btn-text', type: 'button', onclick: () => {
      if (confirm(t('bookResetConfirm'))) { store.resetSeen(); bookView(root); }
    } }, t('bookReset')))));
}

/* ---------- 6. Quiz ---------- */

const quiz = { round: null, i: 0, picked: null, score: 0 };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newRound() {
  quiz.round = shuffle(db.quiz).slice(0, 5).map((q) => ({
    ...q,
    order: shuffle(q.options.map((_, k) => k)),
  }));
  quiz.i = 0; quiz.picked = null; quiz.score = 0;
}

export function quizView(root) {
  const rerender = () => quizView(root);
  if (!quiz.round) {
    root.replaceChildren(h('section', { class: 'center-block' },
      h('h1', {}, t('quizTitle')),
      h('p', { class: 'lead' }, t('quizLead')),
      h('button', { class: 'btn', type: 'button', onclick: () => { newRound(); rerender(); } }, t('quizStart'))));
    return;
  }

  const n = quiz.round.length;
  if (quiz.i >= n) {
    const related = [...new Set(quiz.round.map((q) => q.entityId).filter((id) => db.entityById[id]))];
    root.replaceChildren(h('section', { class: 'center-block' },
      h('h1', {}, t('quizTitle')),
      h('p', { class: 'rank' }, t('quizDone', { s: quiz.score, n })),
      related.length ? h('h2', {}, t('quizRelated')) : null,
      related.length ? h('ul', { class: 'tiles' }, related.map((id) => heroTile(db.entityById[id], openHero))) : null,
      h('button', { class: 'btn', type: 'button', onclick: () => { newRound(); rerender(); } }, t('quizAgain'))));
    return;
  }

  const q = quiz.round[quiz.i];
  const answered = quiz.picked !== null;
  const choices = q.order.map((k) => {
    let cls = 'choice';
    if (answered && k === q.answer) cls += ' right';
    else if (answered && k === quiz.picked) cls += ' wrong';
    return h('li', {}, h('button', { class: cls, type: 'button', disabled: answered, onclick: () => {
      quiz.picked = k;
      if (k === q.answer) quiz.score += 1;
      rerender();
      root.querySelector('.explain')?.focus();
    } }, L(q.options[k])));
  });

  const entity = q.entityId && db.entityById[q.entityId];
  root.replaceChildren(h('section', { class: 'quiz' },
    h('h1', {}, t('quizTitle')),
    h('p', { class: 'muted' }, t('quizProgress', { i: quiz.i + 1, n })),
    h('h2', { class: 'question' }, L(q.q)),
    h('ul', { class: 'choices' }, choices),
    answered ? h('div', { class: 'explain', tabindex: '-1', role: 'status' },
      h('strong', {}, quiz.picked === q.answer ? t('quizRight') : t('quizWrong')), ' ', L(q.explain),
      entity ? h('p', {}, h('a', { href: `#/c/${entity.id}` }, `${t('quizSee')}${t('colon')}${L(entity.name)} ›`)) : null) : null,
    answered ? h('button', { class: 'btn', type: 'button', onclick: () => { quiz.i += 1; quiz.picked = null; rerender(); } },
      quiz.i === n - 1 ? t('quizFinish') : t('quizNext')) : null));
}

/* ---------- 7. Glossary ---------- */

let dictQuery = '';

export function dictView(root, focusId) {
  const list = h('dl', { class: 'dict' });
  const apply = () => {
    const q = dictQuery.trim().toLowerCase();
    const items = db.glossary.filter((g) => !q || [g.wuxia.zh, g.wuxia.en, g.real.zh, g.real.en, g.plain.zh, g.plain.en].join(' ').toLowerCase().includes(q));
    list.replaceChildren(...items.flatMap((g) => [
      h('dt', { id: `term-${g.id}`, class: g.id === focusId ? 'focus' : null }, h('span', { class: 'term' }, L(g.wuxia)), h('span', { class: 'real' }, L(g.real))),
      h('dd', {}, L(g.plain)),
    ]));
    if (!items.length) list.append(h('p', { class: 'muted' }, t('noResults')));
  };
  root.replaceChildren(h('section', {},
    h('h1', {}, t('dictTitle')),
    h('p', { class: 'lead' }, t('dictLead')),
    h('input', { type: 'search', placeholder: t('dictSearch'), 'aria-label': t('dictSearch'), value: dictQuery,
      oninput: (e) => { dictQuery = e.target.value; apply(); } }),
    list));
  apply();
  if (focusId) document.getElementById(`term-${focusId}`)?.scrollIntoView({ block: 'center' });
}

/* ---------- 8. Blade Road (flow) ---------- */

export function flowView(root) {
  const f = db.flow;
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stages = [];
  f.stages.forEach((s, i) => {
    if (i) stages.push(h('div', { class: 'pipe', 'aria-hidden': 'true' }, h('span', { class: 'dot power' }), h('span', { class: 'dot money' })));
    stages.push(h('div', { class: 'stage', style: { '--accent': factionColor(s.factions[0]) } },
      h('span', { class: 'step' }, i + 1),
      h('strong', {}, L(s.label)),
      h('span', { class: 'small' }, L(s.does)),
      h('div', { class: 'tags' }, s.factions.map(factionTag))));
  });
  const road = h('div', { class: `road${paused ? ' paused' : ''}` }, stages);
  const toggle = h('button', { class: 'btn-text', type: 'button', 'aria-pressed': String(paused), onclick: () => {
    paused = !paused;
    road.classList.toggle('paused', paused);
    toggle.textContent = paused ? t('flowPlay') : t('flowPause');
    toggle.setAttribute('aria-pressed', String(paused));
  } }, paused ? t('flowPlay') : t('flowPause'));

  root.replaceChildren(h('section', {},
    h('h1', {}, t('flowTitle')),
    h('p', { class: 'lead' }, L(f.intro)),
    h('div', { class: 'legend' },
      f.flows.map((x) => h('span', { class: `legend-item ${x.kind}` }, h('span', { class: `dot ${x.kind}` }), L(x.label)))),
    road,
    h('div', { class: 'guard', style: { '--accent': factionColor('openshell') } }, '🛡️ ', L(f.guard.label), ' ', factionTag('openshell')),
    h('p', { class: 'center' }, toggle)));
}

export function notFoundView(root) {
  root.replaceChildren(h('section', { class: 'center-block' },
    h('p', { class: 'lead' }, t('notFound')),
    h('a', { class: 'btn', href: '#/map' }, t('back'))));
}
