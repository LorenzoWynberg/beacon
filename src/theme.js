export const THEME_STORAGE_KEY = 'beacon-theme';

export function readStoredTheme(storage) {
  try {
    const v = storage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(storage, theme) {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function resolveTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(t) {
  return t === 'dark' ? 'light' : 'dark';
}
