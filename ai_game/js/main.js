import { loadData, db } from './data.js';
import { t, getLang, langUrl, applyStatic } from './i18n.js';
import { store } from './store.js';
import { h, openCard } from './ui.js';
import { introView, mapView, duckView, factionView, bookView, quizView, dictView, flowView, notFoundView } from './views.js';

const app = document.getElementById('app');
const tabsEl = document.getElementById('tabs');
const langBtn = document.getElementById('lang-toggle');
const dlg = document.getElementById('card-dialog');

const TABS = [
  ['#/map', 'tabMap'], ['#/flow', 'tabFlow'], ['#/quiz', 'tabQuiz'], ['#/dict', 'tabDict'], ['#/book', 'tabBook'],
];

// The page shown underneath an open hero card (#/c/:id), so closing returns there.
let underlay = null;

function renderTabs(current) {
  tabsEl.replaceChildren(...TABS.map(([href, key]) => h('a', {
    href,
    'aria-current': current.startsWith(href) || (href === '#/map' && (current.startsWith('#/f/') || current.startsWith('#/duck'))) ? 'page' : null,
  }, t(key))));
}

function renderPage(hash) {
  const [, name, arg] = hash.split('/');
  underlay = hash;
  renderTabs(hash);
  document.body.dataset.view = name || 'map';
  switch (name) {
    case 'intro': introView(app); break;
    case 'map': mapView(app); break;
    case 'duck': duckView(app); break;
    case 'f': factionView(app, arg); break;
    case 'book': bookView(app); break;
    case 'quiz': quizView(app); break;
    case 'dict': dictView(app, arg); break;
    case 'flow': flowView(app); break;
    default: notFoundView(app);
  }
}

function showCard(id, hash) {
  openCard(id, {
    onClose: () => {
      if (location.hash !== hash) return; // closed because we navigated elsewhere
      history.replaceState(null, '', underlay);
      renderPage(underlay); // refresh "seen" marks and progress
      app.querySelector(`[data-id="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    },
  });
}

function route() {
  const hash = location.hash || (store.introSeen ? '#/map' : '#/intro');
  const [, name, arg] = hash.split('/');

  if (name === 'c') {
    const e = db.entityById[arg];
    if (!e) { if (dlg.open) dlg.close(); renderPage('#/404'); underlay = null; return; }
    // Deep link straight to a card: render its faction page underneath.
    if (!underlay) renderPage(`#/f/${e.primaryFaction}`);
    showCard(arg, hash);
    return;
  }

  if (dlg.open) dlg.close();
  renderPage(hash);
  app.focus({ preventScroll: true });
  if (!(name === 'dict' && arg)) window.scrollTo(0, 0);
}

function syncLang() {
  applyStatic();
  langBtn.textContent = t('langButton');
  langBtn.setAttribute('aria-label', getLang() === 'zh' ? 'Switch to English' : '切換為中文');
}

document.querySelector('.skip').addEventListener('click', (ev) => { ev.preventDefault(); app.focus(); });

langBtn.addEventListener('click', () => location.assign(langUrl(getLang() === 'zh' ? 'en' : 'zh')));

syncLang();
loadData()
  .then(() => {
    window.addEventListener('hashchange', route);
    route();
  })
  .catch((err) => {
    console.error(err);
    app.replaceChildren(h('p', { class: 'pending' }, t('loadError')));
  });
