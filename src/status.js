const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeAge(updated, now) {
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

export function parseStatus(text) {
  const data = JSON.parse(text);
  return {
    updated: data.updated,
    services: data.services.map((s) => {
      const out = { name: s.name, status: s.status };
      if (typeof s.note === 'string') out.note = s.note;
      return out;
    }),
  };
}
