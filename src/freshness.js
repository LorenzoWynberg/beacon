import { formatRelativeAge, isFutureTimestamp, isStale } from './status.js';

export function computeFreshness(updated, now) {
  const age = formatRelativeAge(updated, now);
  const future = age === 'unknown' && isFutureTimestamp(updated, now);
  const stale = isStale(updated, now);
  let bannerText = null;
  if (stale) {
    bannerText = age === 'unknown'
      ? 'This status may be stale — last updated time unknown'
      : `This status may be stale — last updated ${age}`;
  }
  return { age, future, stale, bannerText };
}

export function startFreshnessClock(
  tick,
  { intervalMs = 60_000, setIntervalFn = setInterval, doc = document } = {},
) {
  setIntervalFn(tick, intervalMs);
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'visible') tick();
  });
}
