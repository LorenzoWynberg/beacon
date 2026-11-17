import { uptimeOverWindow } from './status.js';

// Least reliable first: lowest 24 h uptime first, services with no data last,
// ties (and no-data services among themselves) keep their input order.
export function sortLeastReliableFirst(services, now) {
  return services
    .map((s, i) => ({ s, i, key: uptimeOverWindow(s, now) }))
    .sort((a, b) => {
      const aNo = !Number.isFinite(a.key);
      const bNo = !Number.isFinite(b.key);
      if (aNo && bNo) return a.i - b.i;
      if (aNo) return 1;
      if (bNo) return -1;
      return a.key - b.key || a.i - b.i;
    })
    .map((e) => e.s);
}
