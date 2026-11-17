const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const FUTURE_TOLERANCE_MS = 5 * 60_000;

export function isFutureTimestamp(updated, now, toleranceMs = FUTURE_TOLERANCE_MS) {
  if (typeof updated !== 'string') return false;
  const diff = new Date(updated).getTime() - new Date(now).getTime();
  return diff > toleranceMs;
}

export function formatRelativeAge(updated, now) {
  if (isFutureTimestamp(updated, now)) return 'unknown';
  if (typeof updated !== 'string') return 'unknown';
  const then = new Date(updated).getTime();
  const seconds = Math.floor((new Date(now).getTime() - then) / 1000);
  if (Number.isNaN(seconds)) return 'unknown';
  if (seconds < MINUTE) return 'just now';
  if (seconds < HOUR) return `${Math.floor(seconds / MINUTE)} min ago`;
  if (seconds < DAY) return `${Math.floor(seconds / HOUR)} h ago`;
  const days = Math.floor(seconds / DAY);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

export function formatSince(since, now) {
  const age = formatRelativeAge(since, now);
  return age === 'unknown' ? null : age;
}

export function isStale(updated, now) {
  if (isFutureTimestamp(updated, now)) return true;
  if (typeof updated !== 'string') return true;
  const then = new Date(updated).getTime();
  const diff = new Date(now).getTime() - then;
  if (Number.isNaN(diff)) return true;
  return diff > DAY * 1000;
}

export function normaliseStatus(v) {
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'up' || s === 'down') return s;
  }
  return 'unknown';
}

export function parseStatus(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('status.json is not valid JSON');
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('status.json must be a JSON object');
  }
  if (!Array.isArray(data.services)) {
    throw new Error('status.json "services" must be an array');
  }
  return {
    updated: data.updated,
    services: data.services.map((s) => {
      const item = s !== null && typeof s === 'object' ? s : {};
      const raw = item.status;
      const isObj = raw !== null && typeof raw === 'object' && !Array.isArray(raw);
      const out = {
        name: typeof item.name === 'string' ? item.name : '',
        status: typeof raw === 'string' ? 'invalid' : isObj ? normaliseStatus(raw.state) : 'unknown',
      };
      if (isObj && typeof raw.since === 'string' && !Number.isNaN(new Date(raw.since).getTime())) {
        out.since = raw.since;
      }
      if (typeof item.note === 'string') out.note = item.note;
      if (typeof item.group === 'string' && item.group.trim()) out.group = item.group.trim();
      return out;
    }),
  };
}

export function groupServices(services) {
  const nameOf = (s) => (typeof s.group === 'string' ? s.group.trim() : '');
  if (!services.some((s) => nameOf(s))) {
    return { grouped: false, groups: [{ name: null, services }] };
  }
  const map = new Map();
  const other = [];
  for (const s of services) {
    const label = nameOf(s);
    const key = label.toLowerCase();
    if (!key || key === 'other') {
      other.push(s);
      continue;
    }
    if (!map.has(key)) map.set(key, { name: label, services: [] });
    map.get(key).services.push(s);
  }
  const groups = [...map.values()];
  if (other.length) groups.push({ name: 'Other', services: other });
  return { grouped: true, groups };
}
