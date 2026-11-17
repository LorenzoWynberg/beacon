export const REFRESH_INTERVAL_MS = 300000;
export const REFETCH_TIMEOUT_MS = 30000;

export function fetchWithTimeout(fetchFn, url, init, { timeoutMs = REFETCH_TIMEOUT_MS, timer } = {}) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const id = timer.setTimeout(() => {
      controller.abort();
      reject(new Error(`refetch timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    let result;
    try {
      result = Promise.resolve(fetchFn(url, { ...init, signal: controller.signal }));
    } catch (err) {
      result = Promise.reject(err);
    }
    result.then(
      (v) => { timer.clearTimeout(id); resolve(v); },
      (e) => { timer.clearTimeout(id); reject(e); },
    );
  });
}

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
