import { nextTheme, readStoredTheme, resolveTheme, writeStoredTheme } from './theme.js';

function getStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const btn = document.getElementById('theme-toggle');
if (btn) {
  const storage = getStorage();
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let chosen = false;
  let current = resolveTheme(readStoredTheme(storage), Boolean(mq && mq.matches));

  const render = (theme) => {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.textContent = theme === 'dark' ? 'Dark mode: on' : 'Dark mode: off';
  };

  render(current);
  btn.hidden = false;

  btn.addEventListener('click', () => {
    chosen = true;
    current = nextTheme(current);
    document.documentElement.dataset.theme = current;
    writeStoredTheme(storage, current);
    render(current);
  });

  if (mq && typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', (e) => {
      if (chosen || readStoredTheme(storage) !== null) return;
      current = resolveTheme(null, e.matches);
      render(current);
    });
  }
}
