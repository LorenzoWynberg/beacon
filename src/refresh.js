export const REFRESH_INTERVAL_MS = 300000;

export function hasChanged(last, next) {
  return last !== next;
}

export function startPoller({ run, intervalMs = REFRESH_INTERVAL_MS, timer, doc, now }) {
  let lastFetch = now();
  let pending = false;
  let stopped = false;

  function fire() {
    if (pending || stopped) return;
    lastFetch = now();
    pending = true;
    let result;
    try {
      result = run();
    } catch {
      result = undefined;
    }
    Promise.resolve(result)
      .catch(() => {})
      .finally(() => {
        pending = false;
      });
  }

  function tick() {
    if (doc.visibilityState === 'hidden') return;
    fire();
  }

  function onVis() {
    if (doc.visibilityState === 'visible' && now() - lastFetch >= intervalMs) fire();
  }

  const id = timer.setInterval(tick, intervalMs);
  doc.addEventListener('visibilitychange', onVis);

  return {
    stop() {
      stopped = true;
      timer.clearInterval(id);
      doc.removeEventListener('visibilitychange', onVis);
    },
  };
}
