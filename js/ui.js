import { db, hasContent, asset, present } from './data.js';
import { t, L, altBoth } from './i18n.js';
import { store } from './store.js';

/** Tiny element builder: h('div', {class: 'x', onclick}, child, 'text', ...) */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    // setProperty so CSS custom properties like '--accent' work too.
    else if (k === 'style' && typeof v === 'object') Object.entries(v).forEach(([p, val]) => el.style.setProperty(p, val));
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const factionColor = (fid) => (fid === 'nvidia' ? db.leader.color : db.factionById[fid]?.color || '#555');

/**
 * Portrait. Images are produced by the 鑄劍師 pipeline and may not exist yet;
 * each candidate in `srcs` is tried in order, then an ink-seal monogram remains.
 */
export function avatar(srcs, nameObj, color, size = 'md', extraClass = '') {
  const initial = (nameObj?.en || nameObj?.zh || '?').replace(/[^A-Za-z0-9一-鿿]/g, '').slice(0, 2);
  const seal = h('span', { class: 'seal', 'aria-hidden': 'true' }, initial);
  const wrap = h('span', { class: `avatar avatar-${size} ${extraClass}`.trim(), style: { '--accent': color } }, seal);
  const queue = [].concat(srcs || []).filter(present);
  if (queue.length) {
    const img = h('img', { src: asset(queue.shift()), alt: altBoth(nameObj), loading: 'lazy', decoding: 'async', width: 512, height: 512 });
    img.addEventListener('load', () => wrap.classList.add('has-img'));
    img.addEventListener('error', () => (queue.length ? (img.src = asset(queue.shift())) : img.remove()));
    wrap.prepend(img);
  }
  return wrap;
}

/** Logo files live at assets/logos/{id}.svg (or .png). Industries and NVIDIA have none. */
export const logoSrcs = (e) => (e.type === 'company' ? [`assets/logos/${e.id}.svg`, `assets/logos/${e.id}.png`].filter(present) : []);

/** Company logo as the identity avatar; industry cards keep their character art. */
export const identityAvatar = (e, color, size) => (e.type === 'company'
  ? avatar(logoSrcs(e), e.name, color, size, 'logo')
  : avatar(e.image, e.name, color, size));

/** Faction chip led by the original keynote-slide term; with `real`, adds the wuxia name, e.g. "Neoclouds · 兵器行". */
export const factionTag = (fid, { real = false } = {}) => {
  const f = fid === 'nvidia' ? db.leader : db.factionById[fid];
  const label = real ? `${f.slideLabel} · ${L(fid === 'nvidia' ? db.leader.short : f.name)}` : f.slideLabel;
  return h('a', { class: 'tag', href: `#/f/${fid}`, style: { '--accent': factionColor(fid) } }, label);
};

export const importanceLabel = (n) => t(`imp${n}`);
const bondKey = { customer: 'bondCustomer', partner: 'bondPartner', investee: 'bondInvestee', supplier: 'bondSupplier' };
export const bondLabel = (type) => t(bondKey[type]);

const ext = (href, text) => h('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text, h('span', { class: 'sr-only' }, ' (new tab)'));

function section(title, ...body) {
  return h('section', { class: 'card-sec' }, h('h3', {}, title), ...body);
}

/** The faction-style character illustration, shown large at the top of a company card when it exists. */
function characterArt(e) {
  if (!present(e.image)) return null;
  const fig = h('figure', { class: 'card-art', hidden: true });
  const img = h('img', { src: asset(e.image), alt: altBoth(e.nickname?.zh ? e.nickname : e.name), decoding: 'async' });
  img.addEventListener('load', () => { fig.hidden = false; });
  img.addEventListener('error', () => fig.remove());
  fig.append(img);
  return fig;
}

/** Stock snapshot. Static data with an explicit date, plus a link to a live quote. */
function marketBox(m) {
  return section(m.private ? t('funding') : t('market'),
    h('p', { class: 'small muted' }, m.private ? `${t('privateCo')} · ${t('dataDate')}${t('colon')}${m.asOf}` : `${m.ticker} · ${L(m.exchange)} · ${t('dataDate')}${t('colon')}${m.asOf}`),
    h('dl', { class: 'profile' }, m.rows.flatMap((r) => [h('dt', {}, L(r.label)), h('dd', {}, L(r.value))])),
    (m.notes || []).map((n) => h('p', {}, L(n))),
    m.quoteUrl ? h('p', {}, ext(m.quoteUrl, t('liveQuote'))) : null,
    h('p', { class: 'small muted disclaimer' }, t('notAdvice')));
}

/** The "AI insight" lesson: a highlighted box with links to related glossary terms. */
function learnBox(learn) {
  const terms = (learn.terms || []).map((id) => db.glossary.find((g) => g.id === id)).filter(Boolean);
  return h('section', { class: 'learn' },
    h('p', { class: 'learn-kicker' }, t('learn')),
    h('h3', {}, L(learn.title)),
    h('p', {}, L(learn.body)),
    terms.length ? h('p', { class: 'learn-terms small' }, t('learnTerms'),
      terms.map((g) => h('a', { class: 'tag tag-plain', href: `#/dict/${g.id}` }, L(g.real)))) : null);
}

/** Fill and open the hero card dialog. Returns true if this was a new collection. */
export function openCard(id, { onClose } = {}) {
  const e = db.entityById[id];
  const dlg = document.getElementById('card-dialog');
  if (!e) return false;
  const isNew = store.markSeen(id);
  const color = factionColor(e.primaryFaction);
  const written = hasContent(e);

  const linkItems = [];
  if (e.links.official) linkItems.push(h('li', {}, ext(e.links.official, t('linkOfficial'))));
  if (e.links.about) linkItems.push(h('li', {}, ext(e.links.about, t('linkAbout'))));
  for (const n of e.links.nvidia || []) {
    linkItems.push(h('li', {}, ext(n.url, `${t('linkNvidia')}${t('colon')}${n.title}`), n.date ? h('span', { class: 'muted' }, ` · ${n.date}`) : null));
  }

  const close = h('button', { class: 'dlg-close', type: 'button', 'aria-label': t('close') }, '✕');
  const body = h('article', { class: 'card', style: { '--accent': color } },
    close,
    e.type === 'company' ? characterArt(e) : null,
    h('header', { class: 'card-head' },
      identityAvatar(e, color, 'lg'),
      h('div', { class: 'card-id' },
        h('h2', { id: 'card-title' }, L(e.name)),
        e.nickname?.zh || e.nickname?.en ? h('p', { class: 'nick' }, `「${L(e.nickname)}」`) : null,
        h('div', { class: 'tags' },
          e.type === 'industry' ? h('span', { class: 'tag tag-plain' }, t('industryTag')) : null,
          e.factions.map((fid) => factionTag(fid, { real: true }))),
        h('p', { class: 'muted small' }, importanceLabel(e.importance)),
        !e.verified ? h('span', { class: 'badge-unverified' }, `⚠️ ${t('unverified')}`) : null,
      ),
    ),
    isNew ? h('p', { class: 'toast-inline', role: 'status' }, t('newInScroll')) : null,
    !written ? h('p', { class: 'pending' }, t('unverifiedNote')) : null,
    e.nameUncertain ? h('p', { class: 'pending' }, t('nameUncertain')) : null,
    written ? h('p', { class: 'card-lead' }, L(e.plain)) : null,
    e.profile?.length ? section(t('profile'), h('dl', { class: 'profile' },
      e.profile.flatMap((r) => [h('dt', {}, L(r.label)), h('dd', {}, L(r.value))]))) : null,
    e.details ? section(t('details'), h('p', {}, L(e.details))) : null,
    e.learn ? learnBox(e.learn) : null,
    e.insights?.length ? section(t('insights'), h('ol', { class: 'insights' },
      e.insights.map((x) => h('li', {}, h('strong', {}, L(x.title)), h('p', {}, L(x.body)))))) : null,
    written ? section(t('bond'),
      h('div', { class: 'tags' }, (e.nvidiaBond.types || []).map((b) => h('span', { class: 'tag tag-plain' }, bondLabel(b)))),
      h('p', {}, L(e.nvidiaBond))) : null,
    written ? section(t('impact'), h('p', {}, L(e.impact))) : null,
    e.market ? marketBox(e.market) : null,
    e.investments?.length ? section(t('investments'),
      h('ul', { class: 'invest' }, e.investments.map((x) => h('li', {},
        h('div', { class: 'invest-head' }, h('strong', {}, L(x.name)), h('span', { class: 'tag tag-plain' }, L(x.area))),
        h('p', { class: 'small muted' }, `${t('stake')}${t('colon')}${L(x.stake)}`),
        h('p', {}, L(x.note))))),
      e.investmentsNote ? h('p', { class: 'small muted' }, L(e.investmentsNote)) : null) : null,
    e.examples?.length ? section(t('examples'), h('ul', { class: 'examples' },
      e.examples.map((x) => h('li', {}, x.url ? ext(x.url, x.name) : x.name, ' — ', L(x.note))))) : null,
    section(t('links'), linkItems.length ? h('ul', { class: 'links' }, linkItems) : h('p', { class: 'muted' }, t('noLinks'))),
    section(t('sources'), e.sources?.length
      ? h('ol', { class: 'sources' }, e.sources.map((s) => h('li', {}, ext(s.url, s.title))))
      : h('p', { class: 'muted' }, t('noLinks'))),
    h('p', { class: 'muted small asof' }, `${t('asOf')}${t('colon')}${e.asOf}`),
  );

  dlg.replaceChildren(body);
  const done = () => { dlg.close(); };
  close.addEventListener('click', done);
  dlg.onclick = (ev) => { if (ev.target === dlg) done(); };
  dlg.onclose = () => onClose?.();
  if (!dlg.open) dlg.showModal();
  close.focus();
  return isNew;
}

/** Compact clickable hero tile used in lists. */
export function heroTile(e, onOpen) {
  const color = factionColor(e.primaryFaction);
  const seen = store.seen().has(e.id);
  return h('li', {},
    h('button', { class: `tile${seen ? ' seen' : ''}`, type: 'button', 'data-id': e.id, style: { '--accent': color }, onclick: () => onOpen(e.id) },
      identityAvatar(e, color, 'sm'),
      h('span', { class: 'tile-text' },
        h('strong', {}, L(e.name)),
        h('span', { class: 'muted small' }, L(e.nickname) || ' '),
        h('span', { class: 'tile-meta' }, '⭐'.repeat(e.importance),
          !e.verified ? h('span', { class: 'badge-unverified mini' }, t('unverified')) : null),
      ),
      seen ? h('span', { class: 'seen-mark' }, h('span', { 'aria-hidden': 'true' }, '✓'), h('span', { class: 'sr-only' }, t('seenMark'))) : null,
    ),
  );
}
